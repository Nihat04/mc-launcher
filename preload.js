const { contextBridge, ipcRenderer } = require("electron");

const githubInstaller = require("./components/github_installer");
const profileManager = require("./components/profile_manager");

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('update', {
    available: () => githubInstaller.updateAvailable(),
    updateClient: () => githubInstaller.updateClient(),
    installProject: () => githubInstaller.installProject()
});

contextBridge.exposeInMainWorld('profileManager', {
    exist: () => profileManager.exist()
})