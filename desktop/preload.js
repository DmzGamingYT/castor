const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("castor", {
  // app
  appInfo: () => ipcRenderer.invoke("app:info"),

  // providers
  listProviders: () => ipcRenderer.invoke("providers:list"),
  setKey: (id, key) => ipcRenderer.invoke("key:set", id, key),
  refreshModels: (id, baseURL) => ipcRenderer.invoke("models:refresh", id, baseURL),
  testConnection: (id, baseURL) => ipcRenderer.invoke("chat:test", id, baseURL),

  // chat
  stream: (payload) => ipcRenderer.invoke("chat:stream", payload),
  cancel: (reqId) => ipcRenderer.invoke("chat:cancel", reqId),
  onChunk: (cb) => ipcRenderer.on("chat:chunk", (_e, d) => cb(d)),
  onError: (cb) => ipcRenderer.on("chat:error", (_e, d) => cb(d)),
  onEnd: (cb) => ipcRenderer.on("chat:end", (_e, d) => cb(d)),

  // agents planifiés
  listJobs: () => ipcRenderer.invoke("jobs:list"),
  saveJob: (job) => ipcRenderer.invoke("jobs:save", job),
  deleteJob: (id) => ipcRenderer.invoke("jobs:delete", id),
  toggleJob: (id, enabled) => ipcRenderer.invoke("jobs:toggle", id, enabled),
  runJob: (id) => ipcRenderer.invoke("jobs:run", id),
  cancelJob: (id) => ipcRenderer.invoke("jobs:cancel", id),
  onJobsUpdated: (cb) => ipcRenderer.on("jobs:updated", (_e, d) => cb(d)),
  onJobNotification: (cb) => ipcRenderer.on("jobs:notification", (_e, d) => cb(d)),

  // atelier (espace de travail + outils)
  openWorkspace: () => ipcRenderer.invoke("workspace:open"),
  openWorkspacePath: (p) => ipcRenderer.invoke("workspace:openPath", p),
  restoreWorkspace: () => ipcRenderer.invoke("workspace:restore"),
  closeWorkspace: () => ipcRenderer.invoke("workspace:close"),
  workspaceTree: () => ipcRenderer.invoke("workspace:tree"),
  workspaceReadFile: (p) => ipcRenderer.invoke("workspace:readFile", p),
  workspaceChanges: () => ipcRenderer.invoke("workspace:changes"),
  workspaceFileDiff: (p) => ipcRenderer.invoke("workspace:fileDiff", p),
  undoWrite: (callId) => ipcRenderer.invoke("workspace:undo", callId),
  onWorkspaceChanged: (cb) => ipcRenderer.on("workspace:changed", () => cb()),
  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),
  readAttachments: (paths) => ipcRenderer.invoke("attachments:read", paths),
  pathForFile: (file) => webUtils.getPathForFile(file),
  respondApproval: (callId, approved, acceptedHunks) =>
    ipcRenderer.invoke("approval:respond", callId, approved, acceptedHunks),
  onToolStart: (cb) => ipcRenderer.on("tool:start", (_e, d) => cb(d)),
  onToolResult: (cb) => ipcRenderer.on("tool:result", (_e, d) => cb(d)),
  onApprovalRequest: (cb) => ipcRenderer.on("approval:request", (_e, d) => cb(d)),

  // serveurs MCP
  listMcpServers: () => ipcRenderer.invoke("mcp:list"),
  addMcpServer: (config) => ipcRenderer.invoke("mcp:add", config),
  removeMcpServer: (id) => ipcRenderer.invoke("mcp:remove", id),
  stopMcpServer: (id) => ipcRenderer.invoke("mcp:stop", id),
  startMcpServer: (id) => ipcRenderer.invoke("mcp:start", id),

  // synchronisation multi-postes
  exportData: () => ipcRenderer.invoke("sync:export"),
  importData: () => ipcRenderer.invoke("sync:import"),

  // stockage persistant (compétences, mémoire, usage, conversations)
  storeGet: (key) => ipcRenderer.invoke("store:get", key),
  storeSet: (key, value) => ipcRenderer.invoke("store:set", key, value),

  // mises à jour
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onUpdateStatus: (cb) => ipcRenderer.on("updates:status", (_e, d) => cb(d)),
});
