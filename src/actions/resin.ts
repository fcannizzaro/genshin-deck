import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
} from '@stream-deck-for-node/sdk';
import { refreshData, sd } from '../index';
import { PluginSettings } from '../interfaces';

@Action('resin')
export class ResinAction extends BaseAction {
  updateTile(context: string) {
    const { current_resin, error } = sd.pluginSettings.daily || {};
    if (error) {
      return sd.showAlert(context);
    }
    sd.setTitle(context, current_resin?.toString());
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
    if (e.changedKeys.includes('authentication')) {
      refreshData().then();
    }
    this.contexts.forEach(this.updateTile);
  }
}
