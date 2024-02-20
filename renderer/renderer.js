const loader = document.querySelector('.loader')
const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const updateWindow = document.querySelector('.update');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const updateWindowNoBtn = document.querySelector('.update__no-btn');
const updateWindowYesBtn = document.querySelector('.update__yes-btn');
const informationPanelLogger = document.querySelector('.information-panel__logger');
const informationPanelProgress = document.querySelector('.information-panel__progress');

playBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = nickInput.value;
    if(!username) {
        screenLog({outputText:'INVALID USERNAME', type:'error'});
        return;
    }

    loader.classList.add('visible');

    if(await update.available()) {
        await update.updateClient(updateProgress).then(() => screenLog({outputText:"files downloaded", type:'success'}));
        await update.updateProfile().then(() => screenLog({outputText:'PROFILE UPDATED', type:'success'}));
    }
    
    profileManager.saveProperties({username})
    screenLog({outputText:'MINECRAFT LAUNCHED', type:'success'});
    ipcRenderer.send('game:run', {nickName: username});
});

closeLink.addEventListener('click', () => {
    ipcRenderer.send('window:close', {});
})

minimizeLink.addEventListener('click', () => {
    ipcRenderer.send('window:minimize', {});
})

const screenLog = (data) => {
    const {outputText, type} = data;

    if(informationPanelLogger.children.length >= 150) {
        informationPanelLogger.children[0].remove();
    }

    informationPanelLogger.innerHTML += `
        <p class="information-panel__logger__log ${type ? "information-panel__log__"+type : ""}">${outputText}</p>
    `

    informationPanelLogger.scrollTop = informationPanelLogger.scrollHeight - informationPanelLogger.clientHeight;
}

function updateProgress(current, total) {
    informationPanelProgress.textContent = `${current}/${total}`;
}

ipcRenderer.on('game:file-download', (data) => {
    const {current, total} = data;
    updateProgress(current, total);
});

ipcRenderer.on('game:launched', () => {
    loader.classList.remove('visible');
});

const properties = profileManager.getProperties();
if(properties !== null) {
    nickInput.value = properties.username;
}