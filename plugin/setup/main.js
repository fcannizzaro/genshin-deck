const uid = document.getElementById('uid');
const ltoken = document.getElementById('ltoken');
const ltuid = document.getElementById('ltuid');
const save = document.getElementById('save');

const urlParams = new URLSearchParams(window.location.search);

uid.value = urlParams.get('uid');
ltoken.value = urlParams.get('ltoken');
ltuid.value = urlParams.get('ltuid');

save.addEventListener('click', () => {
    const event = new CustomEvent('saveAuthentication', {
        detail: {
            uid: uid.value,
            ltoken: ltoken.value,
            ltuid: ltuid.value
        }
    });
    window.opener.document.dispatchEvent(event);
    window.close();
});
