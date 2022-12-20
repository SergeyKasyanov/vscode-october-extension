import * as vscode from 'vscode';
import { Canceled } from '../../services/generators/errors/canceled';
import { GenericWidgetGenerator } from '../../services/generators/generic-widget-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class GenericWidgetGeneratorUi extends GeneratorUiBase {
    private options = {
        addAssets: 'Add js and css files'
    };

    protected async show(): Promise<void> {
        const plugin = await this.choosePlugin();
        const widget = await this.ask('Widget name', InputValidators.className);
        const options = await this.getOptions();

        const generator = new GenericWidgetGenerator(this.project, plugin, {
            widget,
            addAssets: options.includes(this.options.addAssets)
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Widget generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getOptions() {
        const options = await vscode.window.showQuickPick([
            { label: this.options.addAssets },
        ], { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }
}
