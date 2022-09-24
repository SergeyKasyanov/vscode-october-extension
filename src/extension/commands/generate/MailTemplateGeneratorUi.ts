import * as vscode from 'vscode';
import { pluginsDirectory } from '../../../config';
import { Plugin } from '../../../types/plugin/plugin';
import { Canceled } from '../../../services/generators/errors/canceled';
import { MailTemplateGenerator } from '../../../services/generators/mailTemplateGenerator';
import { GeneratorUiBase } from "./generatorUiBase";

export class MailTemplateGeneratorUi extends GeneratorUiBase {

    protected async show() {
        const pluginCode = await this.choosePlugin();

        let author, plugin;
        [author, plugin] = Plugin.splitCode(pluginCode);

        const path = '/' + [pluginsDirectory(), author.toLowerCase(), plugin.toLowerCase(), 'mail'].join('/') + '/<filename>.htm';

        const filename = await this.getFilename(path);
        const subject = await this.ask('Mail subject');

        const generator = new MailTemplateGenerator(pluginCode, {
            filename,
            subject: subject,
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Template generated!');

        if (generated) {
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
