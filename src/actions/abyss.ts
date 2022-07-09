import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { refreshData, sd } from '../index';
import { createCanvas, loadImage } from 'canvas';
import { PluginSettings } from '../interfaces';
import path from 'path';
import fs from 'fs';

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';

@Action('abyss', { m: 15 })
export class AbyssAction extends BaseAction {
  async updateTile(context: string) {
    let days;
    const { stars, end } = sd.pluginSettings?.abyss || {};
    if (!end) {
      return sd.showAlert(context);
    }
    const diff = new Date(end).getTime() - new Date().getTime();
    const missingDays = Math.floor(diff / (1000 * 3600 * 24));
    if (!missingDays) {
      days = `-${Math.floor(diff / (1000 * 3600))}h`;
    } else {
      days = `-${missingDays}d`;
    }
    const imageBuffer = fs.readFileSync(path.join(__dirname, '../../images/abyss.png'));
    const image = await loadImage(imageBuffer);
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
    sd.showOk(e.context);
    await refreshData();
  }

  async onAppear(e: AppearDisappearEvent) {
    await this.updateTile(e.context);
  }

  async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
    if (!e.changedKeys.includes('abyss')) {
      return;
    }
    this.contexts.forEach(this.updateTile);
  }
}
