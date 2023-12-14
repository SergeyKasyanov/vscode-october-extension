import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { yamlSelector } from '../../helpers/file-selectors';
import path = require('path');

const COMMAND_CREATE_CUSTOM_RELATION_TOOLBAR_BUTTON = 'command.createCustomRelationToolbarButton';

export function registerCreateCustomRelationToolbarButton(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(yamlSelector, new CreateCustomRelationToolbarButton));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_CUSTOM_RELATION_TOOLBAR_BUTTON, createButton));
}

/**
 * Code action for create custom relation toolbar buttons
 */
export class CreateCustomRelationToolbarButton implements vscode.CodeActionProvider<vscode.CodeAction> {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        if (!range.isEmpty) {
            return;
        }

        const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const controller = owner.findEntityByRelatedName(document.fileName) as Controller;
        if (!(controller instanceof Controller)) {
            return;
        }

        const configs = controller.getBehaviorConfigPaths('Backend\\Behaviors\\RelationController');
        if (!configs || !configs.default || !FsHelpers.exists(configs.default)) {
            return;
        }

        if (configs.default !== document.fileName) {
            return;
        }

        const cursor = range.start;

        const lineText = document.lineAt(cursor.line).text;
        if (!lineText.trim().startsWith('toolbarButtons:')) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(cursor, /[\w\-\_]+/);
        if (!wordRange) {
            return;
        }

        const word = lineText.slice(wordRange.start.character, wordRange.end.character);
        if (word === 'toolbarButtons') {
            return;
        }

        const buttonFilePath = path.join(controller.filesDirectory, '_relation_button_' + word + '.' + owner.project.platform?.mainBackendViewExtension);
        if (FsHelpers.exists(buttonFilePath)) {
            return;
        }

        const action = new vscode.CodeAction('Create custom button');
        action.command = {
            command: COMMAND_CREATE_CUSTOM_RELATION_TOOLBAR_BUTTON,
            title: 'Create custom button',
            tooltip: 'Create view file with custom button markup',
            arguments: [
                buttonFilePath,
                word
            ]
        };

        return [action];
    }
}

function createButton(filePath: string, word: string) {
    if (FsHelpers.exists(filePath)) {
        return;
    }

    FsHelpers.writeFile(filePath, '');

    const snippet = new vscode.SnippetString(`<button
    data-required="onAjax"
    class="btn btn-sm btn-secondary relation-button-create"
>
    <i class="octo-icon-create"></i> ${word}
</button>
`);

    vscode.window.showTextDocument(vscode.Uri.file(filePath)).then(editor => {
        editor.insertSnippet(snippet, new vscode.Position(0, 0));
    });
}
