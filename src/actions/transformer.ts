import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  KeyEvent,
  PluginSettingsChanged,
  SettingsChanged,
} from '@stream-deck-for-node/sdk';
import { sd } from '../index';
import { PluginSettings, RecoveryTime } from '../interfaces';

interface TransformerSettings {
  style: 'icon' | 'text';
}

const calcTime = ({ Day, Hour, Minute }: RecoveryTime) => {
  const hours = Hour ? `${Hour}h` : '';
  const minutes = Minute ? `${Minute}m` : '';
  if (Day) {
    return `-${Day}d ${hours}`;
  } else if (Hour) {
    return `-${hours} ${minutes}`;
  } else {
    return `-${minutes}`;
  }
};

@Action('transformer', { m: 1 })
export class TransformerAction extends BaseAction {
  updateTile(context: string) {
    const settings = sd.getSettings<TransformerSettings>(context);
    const { transformer } = sd.pluginSettings.daily || {};
    const recovery = transformer?.recovery_time;
    if (!recovery) {
      return;
    }
    sd.setState(context, recovery.reached && settings.style === 'icon' ? 1 : 0);
    sd.setTitle(
      context,
      recovery.reached ? (settings.style === 'icon' ? '' : 'ready') : calcTime(recovery).trim(),
    );
  }

  onPeriodicUpdate() {
    this.contexts.forEach(this.updateTile);
  }

  onSingleTap(e: KeyEvent) {
    this.updateTile(e.context);
  }

  async onAppear(e: AppearDisappearEvent) {
    this.updateTile(e.context);
  }

  async onSettingsChanged(e: SettingsChanged) {
    this.updateTile(e.context);
  }

  async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
    if (!e.changedKeys.includes('daily')) {
      return;
    }
    this.contexts.forEach(this.updateTile);
  }
}
