import { PluginSettings } from './interfaces';
import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/banner';
import './actions/teapot';
import './actions/transformer';
import './actions/daily-reward';
import './actions/progression';
import { StreamDeck } from '@stream-deck-for-node/sdk';
import { fetchAbyss, fetchDaily, progressionCalculator } from './api/hoyolab';
import { cache } from './util/cache';

export const sd = new StreamDeck<PluginSettings>();

export const GenshinView = sd.registerDynamicView('page', 'GenshinDeck');

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

    console.log(ltoken, ltuid, uid);

    if (ltoken && ltuid && uid) {
      // if (!sd.pluginSettings.progression?.length) {
      const progression = await progressionCalculator({
        ltoken,
        ltuid,
        body: {
          element_attr_ids: [],
          is_all: true,
          lang: 'en-us',
          page: 1,
          size: 100,
          weapon_cat_ids: [],
        },
      });

      sd.setPluginSettings({ progression });

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

const init = async () => {
  await sd.ready();
  await cache.load();
  await refreshData();
  setInterval(refreshData, 1000 * 60);
};

init().then();
