import {Action, AppearDisappearEvent, BaseAction, KeyEvent} from 'elgato-stream-deck-sdk';
import {refreshData, sd} from '../index';

@Action('expedition')
export class ExpeditionAction extends BaseAction {

    updateTile(context: string) {
        const {expeditions = [], error} = sd.pluginSettings.daily || {};
        if (error) {
            return sd.showAlert(context);
        }
        const completed = expeditions.filter((it: any) => it.status != 'Ongoing').length;
        sd.setTitle(context, `${completed} / ${expeditions.length}`);
    }

    async onSingleTap(e: KeyEvent) {
        sd.showOk(e.context)
        await refreshData();
    }

    async onAppear(e: AppearDisappearEvent) {
        this.updateTile(e.context);
    }

    async onPluginSettingsChanged() {
        this.contexts.forEach(this.updateTile);
    }

}
