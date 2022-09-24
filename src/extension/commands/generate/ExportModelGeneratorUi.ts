import * as vscode from 'vscode';
import { ExportModelGenerator } from '../../../services/generators/exportModelGenerator';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

export class ExportModelGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const plugin = await this.choosePlugin();
        const model = await this.ask('Export model name without "Export" suffix', InputValidators.className);

        const generator = (new ExportModelGenerator(plugin, { model }));
        const generated = generator.generate();

        vscode.window.showInformationMessage('Export model generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

}
