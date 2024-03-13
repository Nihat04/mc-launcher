const { contextBridge, ipcRenderer } = require("electron");
const { exec } = require('child_process');
const os = require('os');

const githubInstaller = require("./components/github_installer");
const profileManager = require("./components/profile_manager");

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data = {}) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('update', {
    available: () => githubInstaller.updateAvailable(),
    updateClient: (updateProgressFunc, installAll) => githubInstaller.updateClient(updateProgressFunc, installAll),
    updateProfile: () => githubInstaller.updateProfile()
});

contextBridge.exposeInMainWorld('profileManager', {
    exist: () => profileManager.exist(),
    saveProperties: (data) => profileManager.saveProperties(data),
    getProperties: () => profileManager.getProperties()
})

contextBridge.exposeInMainWorld('system', {
    totalmem: () => os.totalmem(),
    openMinecraftFolder: () => exec('start "" "minecraft"')
})