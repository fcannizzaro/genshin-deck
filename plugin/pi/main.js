const setup = document.getElementById('setup');

document.addEventListener('init', async ({settings, pluginSettings, action}) => {

    console.log(settings);

    // show the actions settings block
    const actionPI = document.getElementById(action);

    if (actionPI) {
        actionPI.className = "";
    }

    // destroy other actions
    Array.from(document.querySelectorAll('.isAction.hidden')).forEach(e => e.parentNode.removeChild(e));

});

let globalSettings = {};

document.addEventListener('stateChange', async ({changed, settings, pluginSettings, action}) => {
    globalSettings = pluginSettings;
});

document.addEventListener('saveAuthentication', async ({detail}) => {
    setPluginSettings('authentication', detail);
});

setup.addEventListener('click', () => {
    const {uid = '', ltoken = '', ltuid = ''} = globalSettings?.authentication || {};
    window.open(`../setup/index.html?uid=${uid}&ltoken=${ltoken}&ltuid=${ltuid}`);
})
