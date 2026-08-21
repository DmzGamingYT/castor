const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("castor", {
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

  // stockage persistant (compétences, mémoire, usage)
  storeGet: (key) => ipcRenderer.invoke("store:get", key),
  storeSet: (key, value) => ipcRenderer.invoke("store:set", key, value),
});
