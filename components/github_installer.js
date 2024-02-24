const { Octokit } = require("@octokit/rest");
const https = require("https");
const fs = require("fs");
const path = require("path");

const profileManager = require("./profile_manager");
const { directory } = require("./mc_launcher");
const { convertBaseToUtf } = require("./baseConverter");

const DIRECTORY_OWNER = "Nihat04";
const DIRECTORY_NAME = "GorloMinecraft";

const PROFILE_PATH = "gorloProfile.json";
const octokit = new Octokit();

async function updateClient(updateProgressFunc, installAll = false) {
    return new Promise(async (resolve, reject) => {
        const folders = [
            "mods",
            "resourcepacks",
            "versions/fabric-loader-0.14.23-1.18.2",
            "resourcepacks/Graphics",
        ];
        const files = ["servers.dat", "options.txt"];

        const progress = {
            done: 0,
            total: 0
        };

        const installFile = async (folderPath, fileData) => {
            if (fileData.type === "dir") {
                return;
            }
            
            progress.total++;
            const newFile = fs.createWriteStream(path.join(folderPath, fileData.name));
        
            https.get(fileData.download_url, (res) => {
                res.pipe(newFile);
            });
            newFile.on("finish", () => {
                if(updateProgressFunc) updateProgressFunc(progress.done, progress.total);
                else console.log(`${progress.done}/${progress.total}`);
                newFile.close();
                progress.done++;
                if (progress.done === progress.total) resolve("done");
            });
        }

        for (folder of folders) {
            const folderPath = path.join(directory, folder);
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const folderData = await getFile(folder).then((res) => res.data);
            const clientFolderContent = profileManager.getFolderContent(folderPath);
            if (!clientFolderContent) reject("ERROR");

            for (file of folderData) {
                if (installAll || !clientFolderContent.find((el) => el.name === file.name)) {
                    installFile(folderPath, file, updateProgressFunc);
                }
            }
        }

        const clientFolderContent = profileManager.getFolderContent(directory);
        if (!clientFolderContent) reject("ERROR");

        for (file of files) {
            if (installAll || !clientFolderContent.find((el) => el.name === file)) {
                const fileData = await getFile(file).then((res) => res.data);
                installFile(directory, fileData);
            }
        }
    });
}

function getFile(filePath) {
    const seasonName = "minecraft_season_1";
    console.log(filePath);
    return octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: DIRECTORY_OWNER,
        repo: DIRECTORY_NAME,
        path: path.join(seasonName, filePath)
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

async function updateAvailable() {
    let clientVersion = profileManager.getVersion();

    if (clientVersion == null) return true;
    let serverVersion = await getVersion();

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
