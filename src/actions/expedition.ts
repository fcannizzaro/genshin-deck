import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { GenshinView, sd } from '../index';
import { PluginSettings } from '../interfaces';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DeviceType } from '@stream-deck-for-node/sdk/lib/types/interfaces';

@Action('expedition')
export class ExpeditionAction extends BaseAction {
  updateTile(context: string) {
    const { expeditions = [] } = sd.pluginSettings.daily || {};
    const completed = expeditions.filter((it: any) => it.status != 'Ongoing').length;
    sd.setTitle(context, `${completed} / ${expeditions.length}`);
  }

  async renderExpedition(image: string, completed: boolean, time: number) {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Verdana';
    ctx.fillStyle = 'white';

    // load image
    const imgRes = await loadImage(image!);
    const imageBuffer = readFileSync(
      join(__dirname, `../../images/${completed ? 'completed' : 'progress'}.png`),
    );
    const bg = await loadImage(imageBuffer);
    // draw images
    ctx.fillRect(0, 0, 128, 128);
    ctx.drawImage(bg, 0, 0, 128, 128);
    ctx.drawImage(imgRes, 0, 0, 128, 128);
    // calc and print remaining time
    let hours = time / 3600;
    const minutes = Math.round((hours - Math.floor(hours)) * 10);
    hours = Math.floor(hours);
    let text = minutes ? `-${minutes}m` : 'done';
    if (hours) {
      text = `-${hours}h ${minutes ? minutes + 'm' : ''}`;
    }
    text = text.trim();
    const textMeasure = ctx.measureText(text);
    ctx.fillText(text, (128 - textMeasure.width) / 2, 28);
    return canvas.toDataURL();
  }

  async onSingleTap(e: KeyEvent) {
    const device = sd.info.devices.find((it) => it.id === e.device)!;
    const dv = GenshinView.show(device, [DeviceType.StreamDeckMini]);
    dv?.clear();

    const { expeditions = [] } = sd.pluginSettings.daily || {};

    if (!dv) {
      return;
    }

    const geometry = dv.geometry;
    const [mappable] = geometry.mappable('bottomLeft', 'bottomRight');

    mappable.map(async (index, i) => {
      const item = expeditions[i];
      dv.update(index, {
        image: item
          ? await this.renderExpedition(
              item.avatar_side_icon,
              item.status !== 'Ongoing',
              item.remained_time,
            )
          : undefined,
      });
    });

    dv.update(geometry.bottomLeft, {
      image: join(__dirname, '../../images/character-back.png'),
      onSingleTap: () => dv.hide(),
    });
  }

  async onAppear(e: AppearDisappearEvent) {
    this.updateTile(e.context);
  }

  async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
    if (!e.changedKeys.includes('daily')) {
      return;
    }
    this.contexts.forEach(this.updateTile);
  }
}
