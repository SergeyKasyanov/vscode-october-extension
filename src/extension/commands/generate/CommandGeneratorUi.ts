import * as vscode from 'vscode';
import { CommandGenerator } from '../../../services/generators/commandGenerator';
import { Canceled } from '../../../services/generators/errors/canceled';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

export class CommandGeneratorUi extends GeneratorUiBase {

    private options = {
        hidden: 'Hidden',
    };

    protected async show() {
        const plugin = await this.choosePlugin();
        const command = await this.ask('Command name', InputValidators.className);
        const description = await this.ask('Command description');
        const options = await this.getOptions();

        const generator = new CommandGenerator(plugin, {
            command,
            description,
            hidden: options.includes(this.options.hidden),
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Command generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getOptions() {
        const options = await vscode.window.showQuickPick([
            { label: this.options.hidden, detail: 'Hide command from artisan commands list' },
        ], { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }

}
