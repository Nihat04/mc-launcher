const { directory } = require("./mc_launcher");
const { convertBaseToUtf, convertUtfToBase } = require("./baseConverter");

const path = require('path');
const fs = require('fs');

const profilePath = path.join(directory, "gorloProfile.json");
const modsFolderPath = path.join(directory, "mods");

function exist() {
    return fs.existsSync(profilePath);
}

function getProfile() {
    if(!fs.existsSync(profilePath)) return null;
    const jsonObj = fs.readFileSync(profilePath);
    return JSON.parse(jsonObj);
}

function getFilesToUpdate() {
    const profile = getProfile();
    return profile.filesToUpadte;
}

function getFoldersToUpdate() {
    const profile = getProfile();
    return profile.foldersToUpdate;
}

function updateProfile(obj) {
    const jsonText = JSON.stringify(obj);
    fs.writeFileSync(profilePath, jsonText);
}

function getVersion() {
    const profile = getProfile();
    if(profile == null) return null
    return profile.modsVersion;
}

function getMods() {
    const modsNames = fs.readdirSync(modsFolderPath);
    return modsNames.map(el => {
        return {
            name: el,
            type: null,
            url: path.join(directory, 'mods', el)
        }
    })
}

function saveProperties(props) {
    const jsonText = JSON.stringify(props);
    fs.writeFileSync(path.join(directory, 'launcherProperties.json'), jsonText);
}

function getProperties() {
    if(!fs.existsSync(path.join(directory, 'launcherProperties.json'))) return null;

    const fileData = fs.readFileSync(path.join(directory, 'launcherProperties.json'));
    return JSON.parse(fileData);
}

function getFolderContent(folderPath = '') {
    if(folderPath === '') folderPath = directory;

    if(!fs.existsSync(folderPath)) return null;

    const folderContent = fs.readdirSync(folderPath);
    return folderContent.map(el => {
        return {
            name: el
        }
    })
}

module.exports = { exist, getVersion, updateProfile, 
                    saveProperties, getProperties, getFolderContent,
                    getFilesToUpdate, getFoldersToUpdate }