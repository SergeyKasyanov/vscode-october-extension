import * as vscode from "vscode";
import { Controller } from "../../../domain/entities/classes/controller";
import { Model } from "../../../domain/entities/classes/model";
import { BackendOwner } from "../../../domain/entities/owners/backend-owner";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { yamlSelector } from "../../helpers/file-selectors";
import { YamlHelpers } from "../../helpers/yaml-helpers";

const DIAGNOSTIC_CHECK_FILE_EXISTS = 'diagnostic.checkFileExists';
const COMMAND_CREATE_FILE = 'command.createConfig';

const PATH_PAIR = /(path|toolbarPartial|buttons|form|list|groups|filter):\s*[\$\~]{0,1}[\'\"]{0,1}[\w\-\_\.\/]+[\'\"]{0,1}/g;

/**
 * Check if files mentioned in yaml config exists
 *
 * @param context
 */
export function registerFileLinkChecks(context: vscode.ExtensionContext) {
    const configLinkDiagnostics = vscode.languages.createDiagnosticCollection('configLinks');
    context.subscriptions.push(configLinkDiagnostics);

    subscribeToDocumentChange(context, configLinkDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(yamlSelector, new CreateConfigFileActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_FILE, createFile));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param configLinkDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, configLinkDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, configLinkDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, configLinkDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, configLinkDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => configLinkDiagnostics.delete(doc.uri)));
}

/**
 * Check if config or partial files mentioned in yaml config exists
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection
) {
    if (!document.fileName.endsWith('.yaml')) {
        return;
    }

    const project = Store.instance.findProject(document.fileName);
    if (!project) {
        return;
    }

    let controller: Controller | undefined;
    const owner = Store.instance.findOwner(document.fileName);
    if (owner instanceof BackendOwner) {
        const entity = owner.findEntityByRelatedName(document.fileName) as Controller | Model | undefined;
        if (entity instanceof Controller) {
            controller = entity;
        } else if (entity instanceof Model) {
            controller = entity.controller;
        }
    }

    const diagnostics: Diagnostic[] = [];

    const matches = document.getText().matchAll(PATH_PAIR);
    for (const match of matches) {
        const line = document.positionAt(match.index!).line;
        const lineText = document.lineAt(line).text;
        const value = YamlHelpers.getKeyAndValue(lineText).value;
        if (!value || value.includes('::')) {
            continue;
        }

        const filePath = PathHelpers.relativePath(
            project.path,
            value,
            controller
        );

        const fileExists = filePath
            && FsHelpers.exists(filePath)
            && FsHelpers.isFile(filePath);

        if (fileExists) {
            continue;
        }

        const range = new vscode.Range(
            new vscode.Position(line, lineText.indexOf(value)),
            new vscode.Position(line, lineText.length)
        );

        const diag = new Diagnostic(range, 'File does not exists', vscode.DiagnosticSeverity.Error);
        diag.code = DIAGNOSTIC_CHECK_FILE_EXISTS;
        diag.filePath = filePath;

        diagnostics.push(diag);
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Provides command for create not existing file
 */
class CreateConfigFileActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code?.toString() === DIAGNOSTIC_CHECK_FILE_EXISTS)
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
