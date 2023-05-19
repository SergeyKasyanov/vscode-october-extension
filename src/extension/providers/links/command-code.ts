import * as vscode from 'vscode';
import { Store } from '../../../domain/services/store';
import { DocumentLink } from '../../types/document-link';

const PLUGIN_FILE = /->(registerConsoleCommand|command)\s*\(\s*[\'\"][\w\.\:\-\_]+[\'\"]/g;
const ARTISAN_CALL = /Artisan::(call|queue)\s*\(\s*[\'\"][\w\.\:\-\_]+[\'\"]/g;
const COMMAND_NAME = /[\'\"][\w\.\:\-\_]+[\'\"]/;

/**
 * Documents links to commands classes for:
 * - $this->registerConsoleCommand('...')
 * - $this->command('...') // for schedules
 * - Artisan::call('...')
 * - Artisan::queue('...')
 */
export class CommandCode implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<DocumentLink[]> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const links: DocumentLink[] = [];

        const matches = [];

        if (document.fileName.endsWith('Plugin.php')) {
            matches.push(...document.getText().matchAll(PLUGIN_FILE));
        }

        matches.push(...document.getText().matchAll(ARTISAN_CALL));

        for (const match of matches) {
            const commandMatch = match[0].match(COMMAND_NAME)!;
            const commandName = commandMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + commandMatch.index! + 1);
            const end = start.translate(0, commandName.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink?(link: DocumentLink): vscode.ProviderResult<DocumentLink> {
        const project = Store.instance.findProject(link.document!.fileName);
        if (!project) {
            return;
        }

        const marked = link.markedText;
        const command = project.commands.find(c => c.commandName === marked);
        if (!command) {
            return;
        }

        link.target = vscode.Uri.file(command.path).with({
            fragment: command.classPosition
        });

        return link;
    }

}
