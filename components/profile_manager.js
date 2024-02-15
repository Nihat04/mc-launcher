const { directory } = require("./mc_launcher");
const path = require('path');
const fs = require('fs');

const profilePath = path.join(directory, "gorlocraftProfile.json");
const modsFolderPath = path.join(directory, "mods");

function exist() {
    return fs.existsSync(profilePath);
}

function getProfile() {
    const jsonObj = fs.readFileSync(profilePath);
    return JSON.parse(jsonObj);
}

function updateProfile(obj) {
    const jsonText = JSON.stringify(obj);
    const file = fs.writeFileSync(profilePath, jsonText);
}

function getVersion() {
    const profile = getProfile();
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

module.exports = { exist, getVersion, getMods, updateProfile }