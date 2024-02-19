const { Octokit } = require("@octokit/rest");
const base64 = require("base-64");
const utf8 = require("utf8");
const https = require("https");
const fs = require("fs");
const path = require("path");

const profileManager = require("./profile_manager");
const { directory } = require("./mc_launcher");

const PROFILE_PATH = "gorlocraftProfile.json";
const octokit = new Octokit();

var resolve = null;
var filesArr = [];

async function installFile(folderPath, fileData, logFunc = null) {
    if (fileData.type === "dir") {
        if (logFunc)
            logFunc({ outputText: "folder is not file", type: "error" });
        return;
    }

    const newFile = fs.createWriteStream(path.join(folderPath, fileData.name));

    https.get(fileData.download_url, (res) => {
        res.pipe(newFile);
    });
    newFile.on("finish", () => {
        if (logFunc !== null)
            logFunc({
                outputText: fileData.name,
                type: "success",
                filesArray: filesArr,
            });
        newFile.close();
        filesArr = filesArr.filter((el) => el !== fileData.name);
        if (filesArr.length === 0) {
            logFunc({
              outputText: `Files installed`,
              type: 'success',
              filesArray: filesArr
            });
            resolve("done");
        }
    });
}

async function updateClient(logFunc) {
    return new Promise(async (res, rej) => {
        resolve = res;
        const folders = [
            "mods",
            "resourcepacks",
            "versions/fabric-loader-0.14.23-1.18.2",
            "resourcepacks/Graphics",
        ];
        const files = ["servers.dat", "options.txt"];

        for (folder of folders) {
            const folderPath = path.join(directory, folder);

            if (!fs.existsSync(folderPath))
                fs.mkdirSync(folderPath, { recursive: true });

            const folderData = await getFile(folder).then((res) => res.data);
            const clientFolderContent =
                profileManager.getFolderContent(folderPath);
            if (!clientFolderContent) {
                logFunc({
                    outputText: "ERROR: folder cannot find",
                    type: "error",
                });
                rej("ERROR");
            }

            for (file of folderData) {
                if (!clientFolderContent.find((el) => el.name === file.name)) {
                    filesArr.push(file.name);
                    installFile(folderPath, file, logFunc);
                }
            }
        }

        const clientFolderContent = profileManager.getFolderContent(directory);
        if (!clientFolderContent) {
            logFunc({ outputText: "ERROR: folder cannot find", type: "error" });
            rej("ERROR");
        }

        for (file of files) {
            if (!clientFolderContent.find((el) => el.name === file)) {
                filesArr.push(file);
                const fileData = await getFile(file).then((res) => res.data);
                installFile(directory, fileData, logFunc);
            }
        }
    });
}

function getFile(filePath) {
    return octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "Nihat04",
        repo: "GorloCraft",
        path: filePath,
    });
}

async function getRepo() {
    return octokit.request("GET /repos/{owner}/{repo}/installation", {
        owner: "Nihat04",
        repo: "GorloCraft",
    });
}

async function getProfile() {
    const fileData = await getFile(PROFILE_PATH).then((res) => res.data);

    const profileDataJsonBase64 = fileData.content;
    const profileDataJson = convertBaseToUtf(profileDataJsonBase64);
    const profileData = JSON.parse(profileDataJson);
    return profileData;
}

async function getVersion() {
    const profileData = await getProfile();
    return profileData.modsVersion;
}

async function getMods() {
    const folderData = await getFile("mods").then((res) => res.data);
    return folderData;
}

function convertBaseToUtf(str) {
    const strBytes = base64.decode(str);
    return utf8.decode(strBytes);
}

async function updateAvailable() {
    var clientVersion = profileManager.getVersion();

    if (clientVersion == null) return true;
    var serverVersion = await getVersion();

    console.log(`client: ${clientVersion}\nserver: ${serverVersion}`);

    return clientVersion !== serverVersion;
}

async function updateProfile() {
    return new Promise(async (res) => {
        const serverProfile = await getProfile();
        profileManager.updateProfile(serverProfile);
        res("PROFILE UPDATE");
    });
}

module.exports = { getFile, updateAvailable, updateClient, updateProfile };
