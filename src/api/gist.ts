import axios from 'axios';
import { Banner } from '../interfaces';

export const fetchBanner = async (): Promise<Banner[]> => {
  try {
    const res = await axios(
      'https://gist.github.com/fcannizzaro/3043559011496c9c641f614feb416414/raw/genshin-banners-deck.json',
    );
    const items: Banner[] = res.data;
    const now = new Date().getTime() / 1000;
    return items.filter((it) => now < it.end);
  } catch (e) {
    return [];
  }
};
