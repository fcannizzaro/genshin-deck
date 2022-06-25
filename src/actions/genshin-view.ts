import { Action, AppearDisappearEvent, BaseAction, KeyEvent } from '@stream-deck-for-node/sdk';
import { sd } from '../index';
import { GenshinView, GenshinViewMatrix, MatrixCell } from '../interfaces';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync } from 'fs';
import { join } from 'path';

const view: GenshinViewMatrix = {};

// reset matrix
export const resetMatrix = () => {
  Object.keys(view).forEach((key) => {
    delete view[key];
  });
};

// fill matrix cell with coordinates
export const setViewCell = (r: number, c: number, cell: MatrixCell) => {
  view[`${r}:${c}`] = cell;
};

@Action('page')
export class GenshinViewAction extends BaseAction {
  findCell(e: any) {
    const coords = e.payload.coordinates;
    return view[`${coords.row}:${coords.column}`];
  }

  cache: Record<string, any> = {};

  // get local image or from cache
  getImage(path: string) {
    if (!this.cache[path]) {
      this.cache[path] = readFileSync(join(__dirname, `../../images/${path}.png`));
    }
    return this.cache[path];
  }

  // render expedition tile
  async renderExpedition(context: string, { image, data }: MatrixCell) {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Verdana';
    ctx.fillStyle = 'white';

    // load image
    const imgRes = await loadImage(image!);
    const imageBuffer = this.getImage(data?.completed ? 'completed' : 'progress');
    const bg = await loadImage(imageBuffer);
    // draw images
    ctx.fillRect(0, 0, 128, 128);
    ctx.drawImage(bg, 0, 0, 128, 128);
    ctx.drawImage(imgRes, 0, 0, 128, 128);
    // calc and print remaining time
    let hours = data?.time / 3600;
    const minutes = Math.round((hours - Math.floor(hours)) * 10);
    hours = Math.floor(hours);
    let text = minutes ? `-${minutes}m` : 'done';
    if (hours) {
      text = `-${hours}h ${minutes ? minutes + 'm' : ''}`;
    }
    text = text.trim();
    const textMeasure = ctx.measureText(text);
    ctx.fillText(text, (128 - textMeasure.width) / 2, 28);
    sd.setTitle(context, '');
    sd.setImage(context, canvas.toDataURL());
  }

  async onAppear(e: AppearDisappearEvent) {
    const def = this.findCell(e);
    switch (def?.type) {
      case GenshinView.expedition:
        await this.renderExpedition(e.context, def);
        break;
      case GenshinView.ui:
        sd.setTitle(e.context, def.title ?? '');
        sd.setImage(e.context);
        break;
      default:
        sd.setTitle(e.context, '');
        sd.setImage(e.context);
    }
  }

  onSingleTap(e: KeyEvent) {
    const def = this.findCell(e);
    if (def?.action === 'back') {
      sd.switchToProfile(sd.uuid, e.device);
      resetMatrix();
      return;
    }
  }
}
