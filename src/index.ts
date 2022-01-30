import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/teapot';
import {StreamDeck} from 'elgato-stream-deck-sdk';
import {fetchAbyss, fetchDaily} from "./api/hoyolab";
import exp from "constants";

interface PluginSettings {
    authentication: {
        uid: string;
        ltuid: string;
        ltoken: string;
    },
    daily: Record<string, any>,
    abyss: {
        end: Date;
        stars: string
    }
}

export const sd = new StreamDeck<PluginSettings>();

export const refreshData = async () => {
    const {ltoken, ltuid, uid} = sd.pluginSettings?.authentication || {};
    if (!ltoken || !ltuid || !uid) {
        sd.pluginSettings.daily = {error: true}
    } else {
        const daily: any = await fetchDaily({ltoken, ltuid, uid});
        const abyss: any = await fetchAbyss({ltoken, ltuid, uid});
        sd.pluginSettings.daily = daily || {};
        sd.pluginSettings.abyss = abyss || {};
    }
    sd.setPluginSettings(sd.pluginSettings)
}

const init = () => refreshData().then(() => setInterval(refreshData, 1000 * 60));

setTimeout(init, 2000);
