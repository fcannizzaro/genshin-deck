import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  SettingsChanged,
} from '@stream-deck-for-node/sdk';
import { GenshinView, sd } from '../index';
import { DeviceType, DynamicViewInstance } from '@stream-deck-for-node/sdk/lib/types/interfaces';
import { combineImages } from '../util/canvas';
import { Character } from '../interfaces';
import { getCharacterDetails } from '../api/hoyolab';
import { cacheById, cacheOrImage } from '../util/cache';
import { join } from 'path';
import uniqBy from 'lodash.uniqby';

const STARS_BACKGROUNDS = {
  5: 'https://act.hoyolab.com/ys/event/calculator-sea/images/star-5.f90aad73.png',
  4: 'https://act.hoyolab.com/ys/event/calculator-sea/images/star-4.f2478054.png',
};

interface ProgressionSettings {
  selected: Character;
}

@Action('progression', { m: 15 })
export class ProgressionAction extends BaseAction<ProgressionSettings> {
  pages: Record<string, number> = {};

  async renderItems(items: any[], dv: DynamicViewInstance, backTo?: () => void) {
    const geometry = dv.geometry;
    const [mappable, ignored] = geometry.mappable('bottomLeft', 'bottomRight');
    const maxPages = Math.ceil(items.length / geometry.total);

    const slicedItems = items.slice(
      dv.page * geometry.total,
      dv.page * geometry.total + geometry.total - ignored + 1,
    );

    const handleBack = () => {
      dv.prevPage(backTo) && this.renderItems(items, dv, backTo);
    };

    const handleNext = () => {
      dv.nextPage(maxPages) && this.renderItems(items, dv, backTo);
    };

    const hasNext = items.length > (dv.page + 1) * geometry.total;

    dv.update(geometry.bottomLeft, {
      image: join(__dirname, '../../images/character-back.png'),
      onSingleTap: handleBack,
    });

    dv.update(geometry.bottomRight, {
      image: hasNext ? join(__dirname, '../../images/character-next.png') : undefined,
      onSingleTap: hasNext ? handleNext : undefined,
    });

    mappable.map((index, i) => {
      const item = slicedItems[i];
      dv.update(index, item ?? {});
    });
  }

  async renderCharacterView(character: Character, dv: DynamicViewInstance, backTo?: () => void) {
    dv.clear();
    const details = await cacheById(`char-details:${character.id}`, () =>
      getCharacterDetails(character.id, character.element_attr_id),
    );
    if (details) {
      const filteredDetails = uniqBy(
        details.filter((it: any) => ![202, 104003, 104319].includes(it.id) && it.num !== 1),
        'name',
      );

      const showNames: Record<string, boolean> = {};

      const items = filteredDetails.map(async (it: any, i: number) => {
        const onSingleTap = async () => {
          showNames[i] = !showNames[i];
          dv.update(it.index, {
            onSingleTap,
            image: await cacheOrImage(it.icon),
            title: showNames[i] ? it.name.replace(/ +/g, '\n') : '',
          });
        };
        return {
          source: it,
          image: await cacheOrImage(it.icon),
          onSingleTap,
        };
      });
      return this.renderItems(await Promise.all(items), dv, backTo);
    }
  }

  async renderCharacters(context: string, dv: DynamicViewInstance) {
    dv.clear();
    const characters = sd.pluginSettings.progression;
    const items = characters.map(async (it: Character) => ({
      onLongPress: () => {
        dv.setSettings(context, { selected: it });
        dv.hide();
      },
      onSingleTap: async () => {
        const oldPage = dv.page;
        dv.page = 0;
        return this.renderCharacterView(it, dv, () => {
          dv.page = oldPage;
          this.renderCharacters(context, dv);
        });
      },
      image: await combineImages(it.id.toString(), STARS_BACKGROUNDS[it.avatar_level], it.icon),
    }));

    const resetIcon = {
      image: join(__dirname, '../../images/character-reset.png'),
      onSingleTap: async () => {
        dv.setSettings(context, { selected: null });
        dv.hide();
      },
    };

    return this.renderItems([resetIcon, ...(await Promise.all(items))], dv);
  }

  async openSelector(context: string, deviceId: string) {
    const device = sd.info.devices.find((it) => it.id === deviceId)!;
    const dv = GenshinView.show(device, [DeviceType.StreamDeckMini]);
    if (!dv) return;
    this.pages[device.id] = 0;
    await this.renderCharacters(context, dv);
  }

  async refreshTile(context: string) {
    const char = sd.getSettings<ProgressionSettings>(context)?.selected;
    sd.setImage(
      context,
      char &&
        (await combineImages(char.id.toString(), STARS_BACKGROUNDS[char.avatar_level], char.icon)),
    );
  }

  async onAppear(e: AppearDisappearEvent<ProgressionSettings>) {
    GenshinView.storeSettings(e.device, e.context);
    return this.refreshTile(e.context);
  }

  onLongPress(e: KeyEvent) {
    return this.openSelector(e.context, e.device);
  }

  async onSingleTap(e: KeyEvent) {
    if (!e.payload.settings.selected) {
      await this.openSelector(e.context, e.device);
    } else {
      const device = sd.info.devices.find((it) => it.id === e.device)!;
      const dv = GenshinView.show(device, [DeviceType.StreamDeckMini]);
      if (dv) {
        return this.renderCharacterView(e.payload.settings.selected, dv);
      }
    }
  }

  onSettingsChanged(e: SettingsChanged) {
    return this.refreshTile(e.context);
  }
}
