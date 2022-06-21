import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { refreshData, sd } from '../index';
import { PluginSettings } from '../interfaces';

@Action('expedition')
export class ExpeditionAction extends BaseAction {
  updateTile(context: string) {
    const { expeditions = [], error } = sd.pluginSettings.daily || {};
    if (error) {
      return sd.showAlert(context);
    }
    const completed = expeditions.filter((it: any) => it.status != 'Ongoing').length;
    sd.setTitle(context, `${completed} / ${expeditions.length}`);
  }

  async onSingleTap(e: KeyEvent) {
    sd.showOk(e.context);
    await refreshData();
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
