import { createCanvas, loadImage } from 'canvas';
import { cacheOrImage } from './cache';

const renderedImages: Record<string, string> = {};

export const combineImages = async (id: string, ...images: string[]) => {
  if (!renderedImages[id]) {
    const canvas = createCanvas(206, 206);
    const ctx = canvas.getContext('2d');
    for (const image of images) {
      const img = await loadImage(await cacheOrImage(image));
      ctx.drawImage(img, 0, 0, 206, 206);
    }
    renderedImages[id] = canvas.toDataURL();
  }
  return renderedImages[id];
};
