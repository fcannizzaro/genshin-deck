const setup = document.getElementById('setup');
const auth = document.getElementById('auth');

document.addEventListener('init', async ({action}) => {

    // show the actions settings block
    const actionPI = document.getElementById(action);

    if (actionPI) {
        actionPI.className = "";
    }

    if (action.endsWith('banner')) {
        auth.className = 'hidden';
    }

    // destroy other actions
    Array.from(document.querySelectorAll('.isAction.hidden')).forEach(e => e.parentNode.removeChild(e));

});

let globalSettings = {};

document.addEventListener('stateChange', async ({pluginSettings}) => {
    globalSettings = pluginSettings;
});

document.addEventListener('saveAuthentication', async ({detail}) => {
    setPluginSettings('authentication', detail);
});

setup.addEventListener('click', () => {
    const {uid = '', ltoken = '', ltuid = ''} = globalSettings?.authentication || {};
    window.open(`../setup/index.html?uid=${uid}&ltoken=${ltoken}&ltuid=${ltuid}`);
})
