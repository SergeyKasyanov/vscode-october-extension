import * as vscode from 'vscode';
import { ComponentGenerator } from '../../services/generators/component-generator';
import { Canceled } from '../../services/generators/errors/canceled';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class ComponentGeneratorUi extends GeneratorUiBase {

    private options = {
        defineProperties: 'Add defineProperties() method',
        init: 'Add init() method',
        onRun: 'Add onRun() method',
        hasMarkup: 'Add default markup',
    };

    protected async show() {
        const plugin = await this.choosePlugin();
        const component = await this.ask('Component name', InputValidators.className);
        const description = await this.ask('Component description');
        const options = await this.getOptions();

        const generator = new ComponentGenerator(this.project, plugin, {
            component,
            description,
            defineProperties: options.includes(this.options.defineProperties),
            init: options.includes(this.options.init),
            onRun: options.includes(this.options.onRun),
            hasMarkup: options.includes(this.options.hasMarkup),
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Component generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getOptions() {
        const options = await vscode.window.showQuickPick([
            { label: this.options.defineProperties },
            { label: this.options.init },
            { label: this.options.onRun },
            { label: this.options.hasMarkup },
        ], { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }

}
