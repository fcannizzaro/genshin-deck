import {Action, AppearDisappearEvent, BaseAction, KeyEvent} from 'elgato-stream-deck-sdk';
import {refreshData, sd} from '../index';

@Action('teapot')
export class ResinAction extends BaseAction {

    updateTile(context: string) {
        const {current_home_coin, error} = sd.pluginSettings.daily || {};
        if (error) {
            return sd.showAlert(context);
        }
        sd.setTitle(context, current_home_coin?.toString());
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
