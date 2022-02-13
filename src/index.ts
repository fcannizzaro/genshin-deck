import './actions/resin';
import './actions/commission';
import './actions/expedition';
import './actions/abyss';
import './actions/banner';
import './actions/teapot';
import {StreamDeck} from '@stream-deck-for-node/sdk';
import {fetchAbyss, fetchBanner, fetchDaily} from "./api/hoyolab";

export interface PluginSettings {
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

    sd.setPluginSettings({
        banner: await fetchBanner() || {}
    });

    if (!ltoken || !ltuid || !uid) {
        sd.setPluginSettings({
            daily: {error: true},
        });
    } else {
        const [daily, abyss]: any = await Promise.all([
            fetchDaily({ltoken, ltuid, uid}),
            fetchAbyss({ltoken, ltuid, uid}),
        ]);
        sd.setPluginSettings({
            daily: daily || {},
            abyss: abyss || {}
        });
    }
}

const init = () => refreshData().then(() => setInterval(refreshData, 1000 * 60));

setTimeout(init, 1500);
