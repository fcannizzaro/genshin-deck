import {Action, AppearDisappearEvent, BaseAction, KeyEvent, PluginSettingsChanged} from '@stream-deck-for-node/sdk';
import {PluginSettings, refreshData, sd} from '../index';

@Action('commission')
export class CommissionAction extends BaseAction {

    updateTile(context: string) {
        const {finished_task_num = 0, total_task_num = 0, error} = sd.pluginSettings.daily || {};
        if (error) {
            return sd.showAlert(context);
        }
        sd.setTitle(context, `${total_task_num - finished_task_num}`);
    }

    async onSingleTap(e: KeyEvent) {
        sd.showOk(e.context)
        await refreshData();
    }

    async onAppear(e: AppearDisappearEvent) {
        this.updateTile(e.context);
    }

    async onPluginSettingsChanged(e: PluginSettingsChanged<PluginSettings>) {
        if (!e.changedKeys.includes("daily")) {
            return
        }
        this.contexts.forEach(this.updateTile);
    }

}
