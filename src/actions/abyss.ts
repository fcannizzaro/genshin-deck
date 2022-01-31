import {Action, AppearDisappearEvent, BaseAction, KeyEvent} from 'elgato-stream-deck-sdk';
import {refreshData, sd} from '../index';
import {createCanvas, loadImage} from 'canvas';
import {abyssImage} from "../res/images";

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

ctx.fillStyle = "white";

@Action('abyss')
export class AbyssAction extends BaseAction {

    async updateTile(context: string) {

        const {stars, end} = sd.pluginSettings?.abyss || {};

        if (!end) {
            return sd.showAlert(context);
        }

        const diff = new Date(end).getTime() - new Date().getTime();
        let days;
        const missingDays = Math.floor(diff / (1000 * 3600 * 24));
        if (!missingDays) {
            days = `-${Math.floor(diff / (1000 * 3600))}h`;
        } else {
            days = `-${missingDays}d`;
        }
        const image = await loadImage(abyssImage);
        ctx.drawImage(image, 0, 0, 256, 256);
        ctx.font = '84px Verdana';
        const daysText = ctx.measureText(days);
        ctx.fillText(days, (256 - daysText.width) / 2, 128);
        ctx.font = '42px Verdana';
        const starsText = ctx.measureText(stars);
        ctx.fillText(stars, 90 + (121 - starsText.width) / 2, 218);
        sd.setImage(context, canvas.toDataURL());
    }

    async onSingleTap(e: KeyEvent) {
        sd.showOk(e.context)
        await refreshData();
    }

    async onAppear(e: AppearDisappearEvent) {
        await this.updateTile(e.context);
    }

    async onPluginSettingsChanged() {
        this.contexts.forEach(this.updateTile);
    }

}
