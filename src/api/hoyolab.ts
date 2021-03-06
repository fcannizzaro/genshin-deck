import axios from 'axios';
import CryptoJS from 'crypto-js';
import { sd } from '../index';

const OS_DS_SALT = '6cqshh5dhw73bzxn20oexa9k516chk7s';

const asciiLetters = () => {
  const length = 26;
  let i = 65;
  return [...Array(length + 6 + length)]
    .map((_, idx) => String.fromCharCode(i + idx))
    .filter((it) => /[a-zA-Z]+/g.test(it));
};

const randomPick = (values: string[], count: number) => {
  const out: string[] = [];
  while (out.length < count) {
    const picked = values[Math.floor(Math.random() * values.length)];
    if (!out.includes(picked)) {
      out.push(picked);
    }
  }
  return out;
};

const generate_ds = () => {
  const t = Math.floor(new Date().getTime() / 1000);
  const r = randomPick(asciiLetters(), 6).join('');
  const md5Hash = CryptoJS.MD5(`salt=${OS_DS_SALT}&t=${t}&r=${r}`);
  return `${t},${r},${md5Hash.toString()}`;
};

const SHARED_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  'x-rpc-app_version': '1.5.0',
  'x-rpc-client_type': '4',
  'x-rpc-language': 'en-us',
};

const SERVER_PREFIX = {
  '1': 'cn_gf01',
  '2': 'cn_gf01',
  '5': 'cn_qd01',
  '6': 'os_usa',
  '7': 'os_euro',
  '8': 'os_asia',
  '9': 'os_cht',
};

export const fetchDaily = async ({ ltoken, ltuid, uid }: any) => {
  try {
    const res = await axios(
      `https://bbs-api-os.mihoyo.com:443/game_record/genshin/api/dailyNote?server=${
        SERVER_PREFIX[uid[0]]
      }&role_id=${uid}`,
      {
        headers: {
          Cookie: `ltoken=${ltoken}; ltuid=${ltuid}`,
          ds: generate_ds(),
          ...SHARED_HEADERS,
        },
      },
    );
    return res.data.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const fetchAbyss = async ({ ltoken, ltuid, uid }: any) => {
  try {
    const res = await axios(
      `https://bbs-api-os.mihoyo.com:443/game_record/genshin/api/spiralAbyss?server=${
        SERVER_PREFIX[uid[0]]
      }&role_id=${uid}&schedule_type=1`,
      {
        headers: {
          Cookie: `ltoken=${ltoken}; ltuid=${ltuid}`,
          ds: generate_ds(),
          ...SHARED_HEADERS,
        },
      },
    );
    const data = res.data.data;
    return {
      stars: data.total_star.toString(),
      end: parseInt(data.end_time) * 1000,
    };
  } catch (e) {
    return null;
  }
};

const dailyRewardRequest = async ({ ltoken, ltuid, method, path }: any) => {
  try {
    const res = await axios(
      `https://sg-hk4e-api.hoyolab.com/event/sol/${path}?act_id=e202102251931481&lang=en-us`,
      {
        method,
        headers: {
          Cookie: `ltoken=${ltoken}; ltuid=${ltuid}`,
          ds: generate_ds(),
          ...SHARED_HEADERS,
        },
      },
    );
    return res.data?.data;
  } catch (e) {
    return null;
  }
};

export const getCharacterSkills = async (
  avatar_id: number,
  element_attr_id: number,
  { ltoken, ltuid }: any,
) => {
  const res = await axios.get(
    `https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list?avatar_id=${avatar_id}&element_attr_id=${element_attr_id}&lang=en-us`,
    {
      headers: {
        Cookie: `ltoken=${ltoken}; ltuid=${ltuid}`,
        ...SHARED_HEADERS,
      },
    },
  );
  return res.data.data.list;
};

export const progressionCalculator = async ({ ltoken, ltuid, path = 'avatar/list', body }: any) => {
  try {
    const res = await axios.post(
      'https://sg-public-api.hoyolab.com/event/calculateos/' + path,
      body,
      {
        headers: {
          Cookie: `ltoken=${ltoken}; ltuid=${ltuid}`,
          ...SHARED_HEADERS,
        },
      },
    );
    const data = res.data?.data;
    return data?.list ?? data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getCharacterDetails = async (
  avatar_id: number,
  element_attr_id: number,
): Promise<any[]> => {
  const { authentication } = sd.pluginSettings;
  const skills = await getCharacterSkills(avatar_id, element_attr_id, authentication);
  try {
    const { avatar_consume, avatar_skill_consume } = await progressionCalculator({
      ...authentication,
      path: 'compute',
      body: {
        avatar_id,
        avatar_level_current: 1,
        avatar_level_target: 90,
        element_attr_id,
        skill_list: skills.map((it: any) => ({
          id: it.group_id,
          level_current: 1,
          level_target: it.max_level,
        })),
        weapon: {},
        reliquary_list: [],
        lang: 'en-us',
      },
    });
    return [...avatar_consume, ...avatar_skill_consume];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getTodayReward = async ({ ltoken, ltuid }: any) => {
  const dailyInfo = await dailyRewardRequest({ ltoken, ltuid, path: 'info' });
  const { total_sign_day, is_sign } = dailyInfo || {};
  const index = total_sign_day - 1 * (is_sign ? 1 : 0);
  const dailyHomeRewards = await dailyRewardRequest({ ltoken, ltuid, path: 'home' });
  return [is_sign, dailyHomeRewards?.awards[index]?.icon];
};

export const claimReward = async ({ ltoken, ltuid }: any) => {
  return dailyRewardRequest({ ltoken, ltuid, method: 'post', path: 'sign' });
};
