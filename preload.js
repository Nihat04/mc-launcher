const { contextBridge, ipcRenderer } = require("electron");
const { exec } = require("child_process");
const os = require("os");

contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel, data = {}) => ipcRenderer.send(channel, data),
    on: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("system", {
    totalmem: () => os.totalmem(),
    openMinecraftFolder: () => exec('start "" "minecraft"'),
});
