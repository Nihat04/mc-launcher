const { Octokit } = require("@octokit/rest");
const https = require("https");
const fs = require("fs");
const path = require("path");

const profileManager = require("./profile_manager");
const { directory } = require("./mc_launcher");
const { convertBaseToUtf } = require("./baseConverter");
const { dir } = require("console");

const DIRECTORY_OWNER = "Nihat04";
const DIRECTORY_NAME = "GorloMinecraft";

const PROFILE_PATH = "minecraft/gorloProfile.json";
const octokit = new Octokit();

async function updateClient(updateProgressFunc, installAll = false) {
    return new Promise(async (resolve, reject) => {
        const progress = {
            done: 0,
            total: 0
        };

        const installFile = async (fileData) => {
            const parentFolderPath = path.dirname(fileData.path)
            if(!fs.existsSync(parentFolderPath)) fs.mkdirSync(parentFolderPath, {recursive:true});

            progress.total++;
            const newFile = fs.createWriteStream(fileData.path);
        
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
        
        if(installAll) {
            const coreFolderData = await getFile(directory).then(res => res.data);
            const installAllFiles = async (folderData) => {
                for(file of folderData) {
                    switch (file.type) {
                        case 'file':
                            installFile(file)
                            break;
                        case 'dir':
                            const filefolderData = await getFile(file.path).then(res => res.data);
                            installAllFiles(filefolderData);
                            break;
                    }
                }
            };
            installAllFiles(coreFolderData);
        } else {
            const profile = await getProfile();
            const folders = profile.folderToUpdate;
            const files = profile.filesToUpdate;
            const filesToDelete = profile.filesToDelete;

            for(let i = 0; i < files.length; i++) {
                const fileData = await getFile(files[i]).then(res => res.data);
                installFile(fileData); 
            }

            for(let i = 0; i < filesToDelete.length; i++) {
                fs.unlinkSync(filesToDelete[i]);
            }
        }
    });
}

function getFile(filePath) {
    return octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: DIRECTORY_OWNER,
        repo: DIRECTORY_NAME,
        path: filePath
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
    return false;
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
