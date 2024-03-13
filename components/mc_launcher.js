const { Client, Authenticator } = require('minecraft-launcher-core');
const path = require('path');

const launcher = new Client();
const directory = path.join("minecraft" );

let opts = {
    authorization: Authenticator.getAuth('Player'),
    root: directory,
    version: {
        number: "1.20.1",
        type: "release",
        custom: "fabric-loader-0.15.7-1.20.1"
    },
    memory: {
        max: "10G",
        min: "1G"
    },
    quickPlay: {
        type: "legacy",
        identifier: "65.21.70.50:25725"
    }
}

function launch(launchOpts) {
    opts.authorization = Authenticator.getAuth(launchOpts.username);
    opts.memory.min = launchOpts.memory.min + "G";
    opts.memory.max = launchOpts.memory.max + "G";
    return {
        minecraft: launcher.launch(opts),
        launcher: launcher
    };
}

module.exports = { launch, directory };
