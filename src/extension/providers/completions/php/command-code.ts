import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/completions';

const PLUGIN_FILE = /->(registerConsoleCommand|command)\s*\(\s*[\'\"]/g;
const ARTISAN_CALL = /Artisan::(call|queue)\s*\(\s*[\'\"]/g;
const COMMAND_NAME_PART = /^[\w\.\:\-\_]*$/;
const COMMAND_NAME = /[\w\.\:\-\_]+/;

/**
 * Complete artisan command names in:
 * - $this->registerConsoleCommand('...')
 * - $this->command('...') // for schedules
 * - Artisan::call('...')
 * - Artisan::queue('...')
 */
export class CommandCode implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const after = [ARTISAN_CALL];
        if (document.fileName.endsWith('Plugin.php')) {
            after.push(PLUGIN_FILE);
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            after,
            COMMAND_NAME_PART
        )) {
            return;
        }

        return project.commands.map(c => {
            const item = new vscode.CompletionItem(c.commandName, vscode.CompletionItemKind.Class);
            item.range = document.getWordRangeAtPosition(position, COMMAND_NAME);

            return item;
        });
    }
}
