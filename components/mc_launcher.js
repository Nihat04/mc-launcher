const { Client, Authenticator } = require("minecraft-launcher-core");
const path = require("path");

const launcher = new Client();
const directory = path.join("REUNION");

let opts = {
    authorization: Authenticator.getAuth("Player"),
    root: directory,
    version: {
        number: "1.14",
        type: "release",
    },
    memory: {
        max: "6G",
        min: "4G",
    },
};

function launch(launchOpts) {
    opts.authorization = Authenticator.getAuth(launchOpts.username);
    opts.memory.min = launchOpts.memory.min + "G";
    opts.memory.max = launchOpts.memory.max + "G";

    const runner = launcher.launch(opts);

    return {
        runner,
        launcher: launcher,
    };
}

module.exports = { launch, directory };
