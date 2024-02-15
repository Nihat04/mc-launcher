const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const updateWindow = document.querySelector('.update');
const updateWindowNoBtn = document.querySelector('.update__no-btn');
const updateWindowYesBtn = document.querySelector('.update__yes-btn');
const progressBarComplete = document.querySelector('.progress-bar__complete')

playBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    increseComplete(10);

    if(!profileManager.exist()) {
        update.installProject();
        return
    }

    if(await update.available()) {
        update.updateClient();
        return
    }
    
    const nickName = nickInput.value;
    
    if(!nickName) {
        console.log("nickname invalid");
        return;
    }

    ipcRenderer.send('game:run', {nickName});
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