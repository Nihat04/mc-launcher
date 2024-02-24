const loader = document.querySelector('.loader')
const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const settingLink = document.querySelector('.header__setting-link');

let minecraftSettings = profileManager.getProperties()
if(!minecraftSettings) {
    minecraftSettings = {
        memory: {
            min: 0,
            max: 4
        }
    };
}

playBtn.addEventListener('click', async (e) => {

    const username = nickInput.value;
    if(!username) {
        return;
    }

    loader.classList.add('visible');

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

const progressBar = document.querySelector('.progress__bar');
function updateProgress(current, total) {
    progressBar.setAttribute('max', total);
    progressBar.setAttribute('value', current);
}

ipcRenderer.on('game:file-download', (data) => {
    const {current, total} = data;
    updateProgress(current, total);
});

ipcRenderer.on('game:launched', () => {
    loader.classList.remove('visible');
});

if(minecraftSettings.username) {
    nickInput.value = minecraftSettings.username;
}