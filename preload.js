const { contextBridge, ipcRenderer } = require("electron");

const githubInstaller = require("./components/github_installer");
const profileManager = require("./components/profile_manager");

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data = {}) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('update', {
    available: () => githubInstaller.updateAvailable(),
    updateClient: (logFunc) => githubInstaller.updateClient(logFunc),
    installGameFiles: (logFunc) => githubInstaller.installGameFiles(logFunc)
});

contextBridge.exposeInMainWorld('profileManager', {
    exist: () => profileManager.exist(),
    saveProperties: (data) => profileManager.saveProperties(data),
    getProperties: () => profileManager.getProperties()
})