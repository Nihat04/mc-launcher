const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const updateWindow = document.querySelector('.update');
const updateWindowNoBtn = document.querySelector('.update__no-btn');
const updateWindowYesBtn = document.querySelector('.update__yes-btn');
const informationPanel = document.querySelector('.information-panel');

playBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if(!profileManager.exist()) {
        // await update.installGameFiles();
        ipcRenderer.send('game:install');
    }

    if(await update.available()) {
        update.updateClient();
        return
    }
    
    const username = nickInput.value;
    
    if(!username) {
        console.log("nickname invalid");
        return;
    }
    profileManager.saveProperties({username})
    ipcRenderer.send('game:run', {nickName: username});
});

closeLink.addEventListener('click', () => {
    ipcRenderer.send('window:close', {});
})

minimizeLink.addEventListener('click', () => {
    ipcRenderer.send('window:minimize', {});
})

updateWindowNoBtn.addEventListener('click', () => {
    updateWindow.classList.remove('visible');
})

updateWindowYesBtn.addEventListener('click', () => {
    update.updateClient();
})

ipcRenderer.on('file:done', () => {
    console.log('done');
})

const properties = profileManager.getProperties();
if(properties !== null) {
    nickInput.value = properties.username;
}