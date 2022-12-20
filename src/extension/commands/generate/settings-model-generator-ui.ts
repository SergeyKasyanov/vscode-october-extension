import * as vscode from 'vscode';
import { Str } from '../../../helpers/str';
import { Canceled } from '../../services/generators/errors/canceled';
import { SettingsModelGenerator } from '../../services/generators/settings-model-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class SettingsModelGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const plugin = await this.choosePlugin();
        const model = await this.ask('Settings model name', InputValidators.className);

        let defaultCode = Str.snakeCase(plugin + '_' + model);
        if (!defaultCode.endsWith('settings')) {
            defaultCode += '_settings';
        }

        const code = await this.ask('Settings code', null, defaultCode);
        const fieldsPlacement = await vscode.window.showQuickPick([
            { label: 'Fields file', description: 'Place fields config in fields.yaml file' },
            { label: 'Array', description: 'Place fields config fields array of model' },
        ]);

        if (fieldsPlacement === undefined) {
            throw new Canceled();
        }

        const placeFieldsInArray = fieldsPlacement.label === 'Array';

        const generator = new SettingsModelGenerator(this.project, plugin, { model, code, placeFieldsInArray });
        const generated = generator.generate();

        vscode.window.showInformationMessage('Settings model generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

}
