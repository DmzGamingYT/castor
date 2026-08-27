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

  // atelier (espace de travail + outils)
  openWorkspace: () => ipcRenderer.invoke("workspace:open"),
  openWorkspacePath: (p) => ipcRenderer.invoke("workspace:openPath", p),
  restoreWorkspace: () => ipcRenderer.invoke("workspace:restore"),
  closeWorkspace: () => ipcRenderer.invoke("workspace:close"),
  workspaceTree: () => ipcRenderer.invoke("workspace:tree"),
  workspaceReadFile: (p) => ipcRenderer.invoke("workspace:readFile", p),
  workspaceChanges: () => ipcRenderer.invoke("workspace:changes"),
  workspaceFileDiff: (p) => ipcRenderer.invoke("workspace:fileDiff", p),
  pathForFile: (file) => webUtils.getPathForFile(file),
  respondApproval: (callId, approved) =>
    ipcRenderer.invoke("approval:respond", callId, approved),
  onToolStart: (cb) => ipcRenderer.on("tool:start", (_e, d) => cb(d)),
  onToolResult: (cb) => ipcRenderer.on("tool:result", (_e, d) => cb(d)),
  onApprovalRequest: (cb) => ipcRenderer.on("approval:request", (_e, d) => cb(d)),

  // stockage persistant (compétences, mémoire, usage, conversations)
  storeGet: (key) => ipcRenderer.invoke("store:get", key),
  storeSet: (key, value) => ipcRenderer.invoke("store:set", key, value),

  // mises à jour
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onUpdateStatus: (cb) => ipcRenderer.on("updates:status", (_e, d) => cb(d)),
});
