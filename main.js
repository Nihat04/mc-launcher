const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");

const mcLauncher = require("./components/mc_launcher");
const profileManager = require("./components/profile_manager");
const githubInstaller = require("./components/github_installer");
const { mainModule } = require("process");

let mainWin;

const createWindow = () => {
    mainWin = new BrowserWindow({
        icon: path.join(__dirname, "icon.ico"),
        width: 950,
        height: 600,
        resizable: false,
        autoHideMenuBar: true,
        transparent: true,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
            devTools: true,
        },
    });

    mainWin.loadFile("renderer/index.html");
};

ipcMain.on("game:run", async (e, data) => {
    const { nickName } = data;
    let minecraft = await mcLauncher.launch(nickName);

    minecraft.launcher.on("download", (e) =>
        mainWin.webContents.send("game:log", e)
    );

    minecraft.launcher.on("debug", (e) =>
        mainWin.webContents.send("game:log", e)
    );

    minecraft.launcher.on("data", (e) =>
        mainWin.webContents.send("game:log", e)
    );

    minecraft.minecraft.then(() => {
        mainWin.close();
        mainWin.webContents.send("game:launched", {});
    });
});

ipcMain.on("window:close", (e, data) => {
    mainWin.close();
});

ipcMain.on("window:minimize", (e, data) => {
    mainWin.minimize();
});

app.whenReady().then(() => {
    createWindow();

    globalShortcut.unregisterAll();
});
