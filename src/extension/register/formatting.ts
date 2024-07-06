import * as vscode from 'vscode';
import { octoberTplSelector } from '../helpers/file-selectors';
import { OctoberTplDocumentFormatting } from '../providers/formatting/october-tpl';

export function registerFormatting(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            octoberTplSelector,
            new OctoberTplDocumentFormatting
        )
    );
}
