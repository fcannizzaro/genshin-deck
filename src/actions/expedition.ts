import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  geometry,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { checkAuthenticationChange, sd } from '../index';
import { GenshinView, PluginSettings } from '../interfaces';
import { setViewCell } from './genshin-view';

/*
 async updateTile(context: string) {
    const { stars, end } = sd.pluginSettings?.abyss || {};

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

 */

@Action('expedition')
export class ExpeditionAction extends BaseAction {
  updateTile(context: string) {
    const { expeditions = [] } = sd.pluginSettings.daily || {};
    const completed = expeditions.filter((it: any) => it.status != 'Ongoing').length;
    sd.setTitle(context, `${completed} / ${expeditions.length}`);
  }

  async onSingleTap(e: KeyEvent) {
    const { expeditions = [] } = sd.pluginSettings.daily || {};
    const deviceType = sd.info.devices.find((it) => it.id === e.device)!.type;
    const g = geometry(deviceType!);
    if (!g) return;
    g.forEach((r: number, c: number, i: number) => {
      const exp = expeditions[i];
      if (!exp) {
        return;
      } else if (g.isNot(r, c, 'bottomLeft')) {
        setViewCell(r, c, {
          type: GenshinView.expedition,
          image: exp.avatar_side_icon,
          data: {
            completed: exp.status !== 'Ongoing',
            time: exp.remained_time,
          },
        });
      }
    });

    setViewCell(...g.positions.bottomLeft, {
      type: GenshinView.ui,
      title: 'your\nback\nicon',
      action: 'back',
    });

    sd.switchToProfile(sd.uuid, e.device, 'GenshinDeck');
  }

  async onAppear(e: AppearDisappearEvent) {
    this.updateTile(e.context);
  }

  async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
    if (checkAuthenticationChange(e) || !e.changedKeys.includes('daily')) {
      return;
    }
    this.contexts.forEach(this.updateTile);
  }
}
