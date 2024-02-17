const { Octokit } = require("@octokit/rest");
const base64 = require("base-64");
const utf8 = require("utf8");
const https = require('https');
const fs = require('fs');
const path = require("path");

const profileManager = require("./profile_manager");
const { directory } = require('./mc_launcher');

const PROFILE_PATH = "gorlocraftProfile.json";
const octokit = new Octokit();

async function installFile(folderPath, fileData, logFunc = null) {
  return new Promise(resolve => {
    const newFile = fs.createWriteStream(path.join(folderPath, fileData.name))
  
    https.get(fileData.download_url, (res) => {
      res.pipe(newFile);
    })
  
    newFile.on('finish', () => {
      if(logFunc !== null)  logFunc(fileData.name);
      newFile.close()
      resolve("INSTALLED");
    });
  })
}

async function installGameFiles(logFunc) {
  const folders = ['mods', 'resourcepacks', 'versions/fabric-loader-0.14.23-1.18.2'];
  const files = ['gorlocraftProfile.json', 'servers.dat', 'options.txt'];

  var totalFiles = [];

  console.log(directory);
  
  for(folder of folders) {
    const folderPath = path.join(directory, folder);

    if(!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {recursive: true});
    }

    const folderData = await getFile(folder).then(res => res.data);

    for(file of folderData) {
      await installFile(folderPath, file, logFunc);
    }
  }

  for(file of files) {
    const fileData = await getFile(file).then(res => res.data);
    await installFile(directory, fileData, logFunc);
  }

  return totalFiles;
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

  if(clientVersion == null) return null;
  var serverVersion = await getVersion();

  console.log(`client: ${clientVersion}\nserver: ${serverVersion}`);

  return clientVersion !== serverVersion;
}

async function updateClient(logFunc) {
  const clientMods = profileManager.getMods();
  const serverMods = await getMods();

  for(mod of serverMods) {
    if(!clientMods.find(el => el.name === mod.name)) {
        const fileDirectory = path.join(directory, 'mods');
        await installFile(fileDirectory, mod, logFunc);
    }
  }

  const serverProfile = await getProfile();
  profileManager.updateProfile(serverProfile);
  logFunc("PROFILE UPDATED")
}

module.exports = { getFile, updateAvailable, updateClient, installGameFiles };
