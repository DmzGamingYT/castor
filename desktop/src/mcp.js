/* Client MCP (Model Context Protocol) — JSON-RPC 2.0 sur stdin/stdout.
   Chaque serveur MCP est un processus enfant dont les outils sont
   découverts puis exposés au modèle alongside les outils natifs. */
const { spawn } = require("node:child_process");
const { EventEmitter } = require("node:events");

class McpClient extends EventEmitter {
  constructor(id, command, args = [], cwd) {
    super();
    this.id = id;
    this.command = command;
    this.args = args;
    this.cwd = cwd;
    this.proc = null;
    this.reqId = 0;
    this.pending = new Map(); // id -> { resolve, reject }
    this.tools = [];          // outils découverts
    this.serverInfo = null;
    this.status = "stopped";  // stopped | starting | running | error
  }

  start() {
    if (this.proc) return;
    this.status = "starting";
    try {
      this.proc = spawn(this.command, this.args, {
        cwd: this.cwd || undefined,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, NO_COLOR: "1" },
      });
      this.status = "running";
      let buf = "";
      this.proc.stdout.on("data", (chunk) => {
        buf += chunk.toString();
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            this._onMessage(msg);
          } catch { /* ignore */ }
        }
      });
      this.proc.stderr.on("data", (d) => { this.emit("log", d.toString()); });
      this.proc.on("close", () => { this.status = "stopped"; this.emit("close"); });
      this.proc.on("error", (err) => { this.status = "error"; this.emit("error", err.message); });
      this._discoverTools();
    } catch (err) {
      this.status = "error";
      this.emit("error", err.message);
    }
  }

  stop() {
    if (!this.proc) return;
    this.proc.kill();
    this.proc = null;
    this.status = "stopped";
    this.tools = [];
  }

  _send(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.reqId;
      this.pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
      this.proc.stdin.write(msg);
    });
  }

  _onMessage(msg) {
    if (msg.id && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || "MCP error"));
      else resolve(msg.result);
    }
    this.emit("notification", msg);
  }

  async _discoverTools() {
    try {
      const init = await this._send("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "castor", version: "1.0" } });
      this.serverInfo = init?.serverInfo || null;
      await this._send("notifications/initialized", {});
      const list = await this._send("tools/list", {});
      this.tools = (list?.tools || []).map((t) => ({
        mcpServer: this.id,
        type: "function",
        function: {
          name: `mcp_${this.id}__${t.name}`,
          description: t.description || "",
          parameters: t.inputSchema || { type: "object", properties: {} },
        },
      }));
      this.emit("tools", this.tools);
    } catch (err) {
      this.emit("error", `tools/list failed: ${err.message}`);
    }
  }

  async callTool(name, args) {
    const result = await this._send("tools/call", { name, arguments: args || {} });
    if (result?.isError) return `ERREUR MCP : ${result.content?.map((c) => c.text).join(", ") || "inconnue"}`;
    return result?.content?.map((c) => c.text).join("\n") || "(aucune sortie)";
  }
}

module.exports = { McpClient };
