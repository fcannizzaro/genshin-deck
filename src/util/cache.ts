import axios from 'axios';
import Cache from 'file-system-cache';
import { tmpdir } from 'os';
import { join } from 'path';

export const cache = Cache({
  basePath: join(tmpdir(), './genshin-deck'),
});

export const cacheOrImage = async (image: string) => {
  let cached = await cache.get(image);
  let img;
  if (!cached) {
    // download image
    const { data } = await axios({ url: image, responseType: 'arraybuffer' });
    // overwrite cached (null)
    img = 'data:image/png;base64, ' + Buffer.from(data, 'binary').toString('base64');
    // cache image
    await cache.set(image, img);
  } else {
    img = cached;
  }
  return img;
};

export const cacheById = async (id: string, obtain: () => any) => {
  let cached = await cache.get(id);
  if (!cached) {
    cached = await obtain();
    cache.set(id, cached).then();
  }
  return cached;
};
