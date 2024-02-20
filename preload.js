const { contextBridge, ipcRenderer } = require("electron");

const githubInstaller = require("./components/github_installer");
const profileManager = require("./components/profile_manager");

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data = {}) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('update', {
    available: () => githubInstaller.updateAvailable(),
    updateClient: (updateProgressFunc) => githubInstaller.updateClient(updateProgressFunc),
    updateProfile: () => githubInstaller.updateProfile()
});

contextBridge.exposeInMainWorld('profileManager', {
    exist: () => profileManager.exist(),
    saveProperties: (data) => profileManager.saveProperties(data),
    getProperties: () => profileManager.getProperties()
})