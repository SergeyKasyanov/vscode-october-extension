import * as vscode from 'vscode';
import { ExportModelGenerator } from '../../services/generators/export-model-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class ExportModelGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const plugin = await this.choosePlugin();
        const model = await this.ask('Export model name without "Export" suffix', InputValidators.className);

        const generator = (new ExportModelGenerator(this.project, plugin, { model }));
        const generated = generator.generate();

        vscode.window.showInformationMessage('Export model generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

}
