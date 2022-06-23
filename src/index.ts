import { PluginSettings } from './interfaces';
import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/banner';
import './actions/teapot';
import { StreamDeck } from '@stream-deck-for-node/sdk';
import { fetchAbyss, fetchDaily } from './api/hoyolab';

export const sd = new StreamDeck<PluginSettings>();

let loading = false;

export const refreshData = async () => {
  // ignore if already running
  if (loading) {
    return;
  }

  // change loading status
  loading = true;
  // obtain data
  try {
    const { ltoken, ltuid, uid } = sd.pluginSettings?.authentication || {};
    if (ltoken && ltuid && uid) {
      const [daily, abyss]: any = await Promise.all([
        fetchDaily({ ltoken, ltuid, uid }),
        fetchAbyss({ ltoken, ltuid, uid }),
      ]);
      sd.setPluginSettings({
        daily: daily || {},
        abyss: abyss || {},
      });
    }
  } catch (e) {
    // ignore request
  }
  // change loading status
  loading = false;
};

process.on('uncaughtException', (e) => {
  console.log(e);
  sd.logMessage('ERROR: ' + e.message);
});

const init = () => refreshData().then(() => setInterval(refreshData, 1000 * 60));

setTimeout(init, 1000);
