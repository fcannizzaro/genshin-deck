import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  SettingsChanged,
} from '@stream-deck-for-node/sdk';
import { sd } from '../index';
import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import { fetchBanner } from '../api/gist';

const timeDiff = require('timediff');

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');
ctx.textAlign = 'center';

interface BannerSettings {
  banner: 'weapon' | 'character';
}

@Action('banner', { m: 15 })
export class BannerAction extends BaseAction {
  cache: Record<string, any> = {};

  async updateTile(context: string) {
    const wishes = await fetchBanner();
    const bannerType = sd.getSettings<BannerSettings>(context)?.banner;
    const banner = wishes.find((it) => it.type === bannerType);

    if (!banner) {
      return;
    }

    const { image, end } = banner;
    const diff = timeDiff(end * 1000, new Date(), 'DHm');
    const title = `${Math.abs(diff.days)}d ${Math.abs(diff.hours)}h`;

    if (!this.cache[image]) {
      // download image
      const { data } = await axios({ url: image, responseType: 'arraybuffer' });

      // cache image
      this.cache[image] = await loadImage(Buffer.from(data, 'binary'));
    }

    const imageRes = this.cache[image];
    const width = (imageRes.width * 256) / imageRes.height;
    ctx.drawImage(imageRes, -(width - 256) / (bannerType === 'weapon' ? 2 : 3), 0, width, 256);
    ctx.font = '42px Verdana';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 160, 256, 70);
    ctx.fillStyle = 'white';
    ctx.fillText(title, 128, 210);
    sd.setImage(context, canvas.toDataURL());
  }

  async onAppear(e: AppearDisappearEvent) {
    await this.updateTile(e.context);
  }

  onPeriodicUpdate() {
    this.contexts.forEach((ctx) => this.updateTile(ctx));
  }

  async onSingleTap(e: KeyEvent) {
    sd.showOk(e.context);
    await this.updateTile(e.context);
  }

  async onSettingsChanged(e: SettingsChanged<BannerSettings>) {
    await this.updateTile(e.context);
  }
}
