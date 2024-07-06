import * as vscode from 'vscode';
import { octoberTplSelector } from '../helpers/file-selectors';
import { OctoberTplDocumentFormatting } from '../providers/formatting/october-tpl';
import { listenToPrettierConfigChange } from '../providers/formatting/config/config-watcher';

export function registerFormatting(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            octoberTplSelector,
            new OctoberTplDocumentFormatting
        )
    );

    listenToPrettierConfigChange();
}
