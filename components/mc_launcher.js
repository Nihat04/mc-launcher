const { Client, Authenticator } = require('minecraft-launcher-core');
const path = require('path');

const launcher = new Client();
const directory = path.join((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) , ".GorloCraft");

let opts = {
    // For production launchers, I recommend not passing 
    // the getAuth function through the authorization field and instead
    // handling authentication outside before you initialize
    // MCLC so you can handle auth based errors and validation!
    authorization: Authenticator.getAuth('Player'),
    root: directory,
    version: {
        number: "1.18.2",
        type: "release",
        custom: "fabric-loader-0.14.23-1.18.2"
    },
    memory: {
        max: "10G",
        min: "4G"
    },
    javaPath: 'javaw.exe'
}

function launch(nickName) {
    opts.authorization = Authenticator.getAuth(nickName);
    return {
        minecraft: launcher.launch(opts),
        launcher: launcher
    };
}

module.exports = { launch, directory };
