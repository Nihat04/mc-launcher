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

async function installProject() {
  const folders = ['mods', 'resourcepacks', 'versions/fabric-loader-0.14.23-1.18.2'];
  const files = ['gorlocraftProfile.json', 'servers.dat', 'options.txt'];

  var totalFiles = files.length;

  console.log(directory);
  
  for(folder of folders) {
    const folderPath = path.join(directory, folder);

    if(!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {recursive: true});
    }

    const folderData = await getFile(folder).then(res => res.data);
    totalFiles += folderData.length;

    for(file of folderData) {
      const newFile = fs.createWriteStream(path.join(directory, folder, file.name))

      https.get(file.download_url, (res) => {
        res.pipe(newFile);
      })

      await newFile.on('finish', () => newFile.close());
    }
  }

  for(file of files) {
    const fileData = await getFile(file).then(res => res.data);
    const newFile = fs.createWriteStream(path.join(directory, fileData.name))

    https.get(fileData.download_url, (res) => {
      res.pipe(newFile);
    })

    await newFile.on('finish', () => newFile.close());
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
  const mods = folderData.map((el) => {
    return {
        name: el.name,
        type: el.type,
        url: el.download_url
    }
  });
  return mods;
}

function convertBaseToUtf(str) {
  const strBytes = base64.decode(str);
  return utf8.decode(strBytes);
}

async function updateAvailable() {
  var clientVersion = profileManager.getVersion();
  var serverVersion = await getVersion();

  console.log(`client: ${clientVersion}\nserver: ${serverVersion}`);

  return clientVersion !== serverVersion;
}

async function updateClient() {
  const clientMods = profileManager.getMods();
  const serverMods = await getMods();

  for(mod of serverMods) {
    if(!clientMods.find(el => el.name === mod.name)) {
        const file = fs.createWriteStream(path.join(directory, 'mods', mod.name));
        const request = https.get(mod.url, (res) => {
            res.pipe(file);
        });

        file.on('finish', () => file.close);
    }
  }

  const serverProfile = await getProfile();
  profileManager.updateProfile(serverProfile);
}

module.exports = { getFile, updateAvailable, updateClient, installProject };
