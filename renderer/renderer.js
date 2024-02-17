const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const updateWindow = document.querySelector('.update');
const updateWindowNoBtn = document.querySelector('.update__no-btn');
const updateWindowYesBtn = document.querySelector('.update__yes-btn');
const informationPanel = document.querySelector('.information-panel');
const loader = document.querySelector('.loader')

playBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = nickInput.value;
    if(!username) {
        screenLog('INVALID USERNAME')
        return;
    }

    loader.classList.add('visible');
    if(!profileManager.exist()) {
        await update.installGameFiles(screenLog);
    } else {   
        if(await update.available()) {
            await update.updateClient(screenLog);
        }
    }
    
    profileManager.saveProperties({username})
    screenLog('MINECRAFT LAUNCHED');
    ipcRenderer.send('game:run', {nickName: username});
});

closeLink.addEventListener('click', () => {
    ipcRenderer.send('window:close', {});
})

minimizeLink.addEventListener('click', () => {
    ipcRenderer.send('window:minimize', {});
})

const properties = profileManager.getProperties();
if(properties !== null) {
    nickInput.value = properties.username;
}

const screenLog = (text) => {
    informationPanel.innerHTML += `
        <p class="information-panel__log">${text}</p>
    `
    informationPanel.scrollTop = informationPanel.scrollHeight - informationPanel.clientHeight;
}