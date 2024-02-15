const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('path');

const mcLauncher = require('./components/mc_launcher');
const profileManager = require('./components/profile_manager');
const githubInstaller = require('./components/github_installer');

let mainWin;

const createWindow = () => {
    mainWin = new BrowserWindow({
        width: 950,
        height: 600,
        resizable: false,
        autoHideMenuBar: true,
        transparent: true,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWin.webContents.openDevTools();
    mainWin.loadFile('renderer/index.html');
}

ipcMain.on('game:run', (e, data) => {
    const {nickName} = data;
    let minecraft = mcLauncher.launch(nickName, mainWin);
    minecraft.then(()=>mainWin.close());
})

ipcMain.on('window:close', (e, data) => {
    mainWin.close();
})

ipcMain.on('window:minimize', (e, data) => {
    mainWin.minimize();
})

function send(data) {
    mainWin.webContents.send('file:done', data);
}

app.whenReady().then(() => {
    createWindow();
});

module.exports = { send };