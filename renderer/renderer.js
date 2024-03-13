const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const settingLink = document.querySelector('.header__setting-link');
const reinstallBtn = document.querySelector('.settings__reinstall__btn')

let minecraftSettings = profileManager.getProperties()
if(!minecraftSettings) {
    minecraftSettings = {
        memory: {
            min: 0,
            max: 10
        }
    };
}

playBtn.addEventListener('click', async (e) => {

    const username = nickInput.value;
    if(!username) {
        return;
    }
    minecraftSettings.username = username;

    if(!profileManager.exist()) {
        await update.updateClient(updateProgress, true);
        await update.updateProfile();
    }
    if(await update.available()) {
        await update.updateClient(updateProgress);
        await update.updateProfile();
    }
    
    profileManager.saveProperties(minecraftSettings);
    ipcRenderer.send('game:run', minecraftSettings);
});

closeLink.addEventListener('click', () => {
    ipcRenderer.send('window:close', {});
});

minimizeLink.addEventListener('click', () => {
    ipcRenderer.send('window:minimize', {});
});

settingLink.addEventListener('click', () => {
    const modal = document.querySelector('.settings');
    const memoryRange = document.querySelector('.settings__memmory__range');
    const memoryValue = document.querySelector('.settings__memmory__value');
    const folderBtn = document.querySelector('.settings__folder-open__link');

    if(modal.open) {
        modal.close()
        return;
    }
    
    const totalRam = Math.round(system.totalmem() / Math.pow(2, 30));
    memoryRange.setAttribute('max', totalRam);
    memoryRange.value = minecraftSettings.memory.max;
    memoryRange.addEventListener('input', (e) => {
        e.preventDefault();
        minecraftSettings.memory.max = memoryRange.value;
        memoryValue.textContent = memoryRange.value;
    })
    memoryValue.textContent = memoryRange.value;

    folderBtn.addEventListener('click', () => system.openMinecraftFolder());

    modal.show();
});

reinstallBtn.addEventListener('click', async () => {
    await update.updateClient(updateProgress, true);
})

const progressBar = document.querySelector('.progress__bar');
function updateProgress(current, total) {
    progressBar.setAttribute('max', total);
    progressBar.setAttribute('value', current);
}

ipcRenderer.on('game:file-download', (data) => {
    const {current, total} = data;
    updateProgress(current, total);
});

window.addEventListener('DOMContentLoaded', () => {
    if(minecraftSettings.username) {
        nickInput.value = minecraftSettings.username;
    }
})
