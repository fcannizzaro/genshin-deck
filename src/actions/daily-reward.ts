import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { sd } from '../index';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync } from 'fs';
import { join } from 'path';
import { claimReward, getTodayReward } from '../api/hoyolab';

@Action('daily-reward')
export class DailyReward extends BaseAction {
  async renderReward(context: string, image: string, claimed: boolean) {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    const icon = await loadImage(image!);
    const bg = await loadImage(readFileSync(join(__dirname, '../../images/daily.png')));
    ctx.drawImage(bg, 0, 0, 128, 128);
    ctx.drawImage(icon, 9, 9, 110, 110);
    if (claimed) {
      const done = await loadImage(readFileSync(join(__dirname, '../../images/done.png')));
      ctx.drawImage(done, 9, 9, 110, 110);
    }
    sd.setImage(context, canvas.toDataURL());
  }

  async refreshAction(context: string) {
    const [claimed, icon] = await getTodayReward(sd.pluginSettings.authentication);
    await this.renderReward(context, icon, claimed);
  }

  async onAppear(e: AppearDisappearEvent) {
    await this.refreshAction(e.context);
  }

  onPluginSettingsChanged(e: PluginSettingsChanged) {
    if (e.changedKeys.includes('authentication')) {
      this.contexts.forEach((ctx) => this.refreshAction(ctx));
    }
  }

  async onSingleTap(e: KeyEvent) {
    const { retcode } = await claimReward(sd.pluginSettings.authentication);
    if (retcode === -5003) {
      sd.showAlert(e.context);
    } else {
      sd.showOk(e.context);
    }
    await this.refreshAction(e.context);
  }
}
