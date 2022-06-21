import { PluginSettings } from './interfaces';
import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/banner';
import './actions/teapot';
import { StreamDeck } from '@stream-deck-for-node/sdk';
import { fetchAbyss, fetchDaily } from './api/hoyolab';
import { fetchBanner } from './api/gist';

export const sd = new StreamDeck<PluginSettings>();

export const refreshData = async () => {
  const { ltoken, ltuid, uid } = sd.pluginSettings?.authentication || {};
  const banner = await fetchBanner();

  if (banner.length) {
    sd.setPluginSettings({ banner });
  }

  if (!ltoken || !ltuid || !uid) {
    sd.setPluginSettings({
      daily: { error: true },
    });
  } else {
    const [daily, abyss]: any = await Promise.all([
      fetchDaily({ ltoken, ltuid, uid }),
      fetchAbyss({ ltoken, ltuid, uid }),
    ]);
    sd.setPluginSettings({
      daily: daily || {},
      abyss: abyss || {},
    });
  }
};

process.on('uncaughtException', (e) => {
  console.log(e);
  sd.logMessage('ERROR: ' + e.message);
});

const init = () => refreshData().then(() => setInterval(refreshData, 1000 * 60));

setTimeout(init, 1000);
