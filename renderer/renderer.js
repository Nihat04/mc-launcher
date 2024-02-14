const playBtn = document.querySelector("#play-btn");
const nickInput = document.querySelector('#nick-name');
const closeLink = document.querySelector('.header__window-close__link');
const minimizeLink = document.querySelector('.header__window-minimize__link')
const updateWindow = document.querySelector('.update');
const updateWindowNoBtn = document.querySelector('.update__no-btn');
const updateWindowYesBtn = document.querySelector('.update__yes-btn');

playBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if(await update.available()) {
        updateWindow.classList.add('visible')
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