import {Action, AppearDisappearEvent, BaseAction, KeyEvent, PluginSettingsChanged} from '@stream-deck-for-node/sdk';
import {PluginSettings, refreshData, sd} from '../index';
import {createCanvas, loadImage} from 'canvas';
import {SettingsChanged} from "../../../../sdk/src";

const timeDiff = require('timediff');

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');
ctx.textAlign = "center";

interface BannerSettings {
    banner: 'weapon' | 'character';
}

@Action('banner')
export class BannerAction extends BaseAction {

    async updateTile(context: string, bannerType?: string) {
        if (!bannerType) {
            bannerType = (await sd.getSettings<BannerSettings>(context)).banner || 'character';
        }
        const banner = (sd.pluginSettings?.banner || []).find(it => it.type === bannerType);
        if (!banner) {
            return;
        }
        const {image, end} = banner;
        const diff = timeDiff(end, new Date(), 'DHm');
        const title = `${Math.abs(diff.days)}d ${Math.abs(diff.hours)}h`;
        const imageRes = await loadImage(`https://genshin-wishes.com/content${image}`);
        const width = imageRes.width * 256 / imageRes.height;
        ctx.drawImage(imageRes, -(width - 256) / (bannerType === 'weapon' ? 2 : 3), 0, width, 256);
        ctx.font = '42px Verdana';
        ctx.fillStyle = "black";
        ctx.fillRect(0, 160, 256, 70);
        ctx.fillStyle = "white";
        ctx.fillText(title, 128, 210);
        sd.setImage(context, canvas.toDataURL());
    }

    async onSingleTap(e: KeyEvent) {
        sd.showOk(e.context)
        await refreshData();
    }

    async onAppear(e: AppearDisappearEvent) {
        await this.updateTile(e.context);
    }

    async onSettingsChanged(e: SettingsChanged<BannerSettings>) {
        await this.updateTile(e.context, e.settings.banner);
    }

    async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
        if (!e.changedKeys.includes("banner")) {
            return
        }
        this.contexts.forEach(this.updateTile);
    }

}
