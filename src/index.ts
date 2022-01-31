import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/banner';
import './actions/teapot';
import {StreamDeck} from 'elgato-stream-deck-sdk';
import {fetchAbyss, fetchBanner, fetchDaily} from "./api/hoyolab";

interface PluginSettings {
    authentication: {
        uid: string;
        ltuid: string;
        ltoken: string;
    },
    banner: Array<{
        type: string;
        end: string;
        image: string;
    }>;
    daily: Record<string, any>,
    abyss: {
        end: number;
        stars: string
    }
}

export const sd = new StreamDeck<PluginSettings>();

export const refreshData = async () => {
    const {ltoken, ltuid, uid} = sd.pluginSettings?.authentication || {};
    if (!ltoken || !ltuid || !uid) {
        sd.pluginSettings.daily = {error: true}
    } else {
        const [daily, abyss, banner]: any = await Promise.all([
            fetchDaily({ltoken, ltuid, uid}),
            fetchAbyss({ltoken, ltuid, uid}),
            fetchBanner()
        ]);
        sd.pluginSettings.daily = daily || {};
        sd.pluginSettings.abyss = abyss || {};
        sd.pluginSettings.banner = banner || {};
    }
    sd.setPluginSettings(sd.pluginSettings)
}

const init = () => refreshData().then(() => setInterval(refreshData, 1000 * 60));

setTimeout(init, 1500);
