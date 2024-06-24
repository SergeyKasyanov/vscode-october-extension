import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { Widget } from '../../../domain/entities/classes/widget';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { PathHelpers } from '../../../domain/helpers/path-helpers';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';

const DIAGNOSTIC_CHECK_MAKE_PARTIAL_PATH_EXISTENCE = 'diagnostic.checkMakePartialPathExistence';
const COMMAND_CREATE_FILE = 'command.createBackendPartial';

const PHP_MAKE_PARTIAL_METHODS_GLOBAL = /->\s*(makePartial|makeHintPartial)\s*\(\s*[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/g;
const PARTIAL_NAME = /[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/;

/**
 * Register partial file existence checks
 *
 * @param context
 */
export function registerMakePartialPathChecks(context: vscode.ExtensionContext) {
    const partialPathDiagnostics = vscode.languages.createDiagnosticCollection('fileLinks');
    context.subscriptions.push(partialPathDiagnostics);

    subscribeToDocumentChange(context, partialPathDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(phpSelector, new CreatePartialFileActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_FILE, createFile));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param partialPathDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, partialPathDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, partialPathDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, partialPathDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, partialPathDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => partialPathDiagnostics.delete(doc.uri)));
}

/**
 * Check if partial file exists
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection
) {
    if (document.languageId !== 'php') {
        return;
    }

    const project = Store.instance.findProject(document.fileName);
    if (!project) {
        return;
    }

    const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
    if (!(owner instanceof BackendOwner)) {
        return;
    }

    const entity = (owner.findEntityByPath(document.fileName) || owner.findEntityByRelatedName(document.fileName)) as Controller | Widget | undefined;

    const diagnostics: Diagnostic[] = [];

    const matches = document.getText().matchAll(PHP_MAKE_PARTIAL_METHODS_GLOBAL);
    for (const methodMatch of matches) {
        const line = document.positionAt(methodMatch.index!).line;
        const lineText = document.lineAt(line).text;
        const value = methodMatch[0].match(PARTIAL_NAME);
        if (!value) {
            continue;
        }

        const partialName = value[0].slice(1, -1);

        const filePath = PathHelpers.relativePath(project.path, partialName, entity);

        const fileExists = filePath
            && FsHelpers.exists(filePath)
            && FsHelpers.isFile(filePath);

        if (fileExists) {
            continue;
        }

        const start = new vscode.Position(line, lineText.indexOf(partialName));
        const end = start.translate(0, partialName.length);
        const range = new vscode.Range(start, end);

        const diag = new Diagnostic(range, 'File does not exists', vscode.DiagnosticSeverity.Error);
        diag.code = DIAGNOSTIC_CHECK_MAKE_PARTIAL_PATH_EXISTENCE;
        diag.filePath = filePath;

        diagnostics.push(diag);
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

class CreatePartialFileActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code?.toString() === DIAGNOSTIC_CHECK_MAKE_PARTIAL_PATH_EXISTENCE)
            .map(diagnostic => {
                const action = new vscode.CodeAction('Create file', vscode.CodeActionKind.QuickFix);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: COMMAND_CREATE_FILE,
                    title: 'Create file',
                    arguments: [diagnostic]
                };

                return action;
            });
    }
}

/**
 * Create not existing file
 *
 * @param diagnostic
 */
function createFile(diagnostic: Diagnostic) {
    if (!diagnostic.filePath) {
        vscode.window.showErrorMessage('Unknown file path');
        return;
    }

    FsHelpers.writeFile(diagnostic.filePath, '');

    vscode.window.showTextDocument(vscode.Uri.file(diagnostic.filePath));
}

/**
 * Extend default diagnostic class for provide additional information
 */
class Diagnostic extends vscode.Diagnostic {
    filePath?: string;
}
