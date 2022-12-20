import * as vscode from 'vscode';
import { ImportModelGenerator } from '../../services/generators/import-model-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class ImportModelGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const plugin = await this.choosePlugin();
        const model = await this.ask('Import model name without "Import" suffix', InputValidators.className);

        const generator = new ImportModelGenerator(this.project, plugin, { model });
        const generated = generator.generate();

        vscode.window.showInformationMessage('Import model generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

}
