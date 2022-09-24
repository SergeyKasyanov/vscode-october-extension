import * as vscode from 'vscode';
import { Canceled } from '../../../services/generators/errors/canceled';
import { ReportWidgetGenerator } from '../../../services/generators/reportWidgetGenerator';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

export class ReportWidgetGeneratorUi extends GeneratorUiBase {
    private options = {
        addAssets: 'Add js and css files'
    };

    protected async show(): Promise<void> {
        const plugin = await this.choosePlugin();
        const widget = await this.ask('Report widget name', InputValidators.className);
        const options = await this.getOptions();

        const generator = new ReportWidgetGenerator(plugin, {
            widget,
            addAssets: options.includes(this.options.addAssets)
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Report widget generated!');

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
