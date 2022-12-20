import path = require('path');
import * as vscode from 'vscode';
import { Canceled } from '../../services/generators/errors/canceled';
import { MailTemplateGenerator } from '../../services/generators/mail-template-generator';
import { GeneratorUiBase } from "./generator-ui-base";

export class MailTemplateGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const pluginCode = await this.choosePlugin();

        const plugin = pluginCode === 'app'
            ? this.project.appDir
            : this.project.plugins.find(p => p.name === pluginCode)!;

        if (!plugin) {
            vscode.window.showErrorMessage('Plugin does not exists');
            return;
        }

        const pathHint = path.join(plugin.path, 'views', 'mail', '<filename>.htm');

        const filename = await this.getFilename(pathHint);
        const subject = await this.ask('Mail subject');

        const generator = new MailTemplateGenerator(this.project, pluginCode, {
            filename,
            subject: subject,
        });

        const generated = generator.generate();

        if (generated) {
            vscode.window.showInformationMessage('Template generated!');
            this.showGeneratedFiles(generated);
        }
    }

    private async getFilename(path: string) {
        const filename = await vscode.window.showInputBox({
            title: 'Enter filename',
            prompt: 'Template will be placed at ' + path,
        });

        if (filename === undefined) {
            throw new Canceled();
        }

        return filename;
    }

}
