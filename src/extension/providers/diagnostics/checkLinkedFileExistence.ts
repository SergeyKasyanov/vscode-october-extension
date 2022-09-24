import path = require("path");
import * as fs from "fs";
import * as vscode from "vscode";
import { yamlSelector } from "../../../helpers/fileSelectors";
import { pluginsPath, rootPath } from "../../../helpers/paths";
import { writeFile } from "../../../helpers/writeFile";

const DIAGNOSTIC_CHECK_CONFIG_EXISTS = 'diagnostic.checkConfigExists';
const COMMAND_CREATE_CONFIG = 'command.createConfig';

let configLinkDiagnostics: vscode.DiagnosticCollection;

export function registerFileLinkChecks(context: vscode.ExtensionContext) {
    configLinkDiagnostics = vscode.languages.createDiagnosticCollection('configLinkDiagnostics');
    context.subscriptions.push(configLinkDiagnostics);

    subscribeToDocumentChange(context, configLinkDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(yamlSelector, new CreateConfigFileActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_CONFIG, (document, range) => createConfig(document, range)));
}

function subscribeToDocumentChange(context: vscode.ExtensionContext, configLinkDiagnostics: vscode.DiagnosticCollection) {
    const checkConfigExistence = new CheckLinkedFileExistence();

    if (vscode.window.activeTextEditor) {
        checkConfigExistence.provideDiagnostics(vscode.window.activeTextEditor.document, configLinkDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            checkConfigExistence.provideDiagnostics(editor.document, configLinkDiagnostics);
        }
    }));

}

class CreateConfigFileActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return context.diagnostics
            .filter(d => d.code?.toString() === DIAGNOSTIC_CHECK_CONFIG_EXISTS)
            .map(d => this.createCodeAction(document, d));
    }

    private createCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): any {
        const action = new vscode.CodeAction('Create file', vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.command = {
            command: COMMAND_CREATE_CONFIG,
            title: 'Create file',
            arguments: [document, diagnostic.range]
        };

        return action;
    }
}

class CheckLinkedFileExistence {

    private document: vscode.TextDocument | undefined;
    private diagnostics: vscode.Diagnostic[] = [];

    provideDiagnostics(
        document: vscode.TextDocument,
        diagnosticsCollection: vscode.DiagnosticCollection
    ) {
        this.diagnostics = [];

        const pathAttributes = ['list', 'form', 'groups', 'filter', 'path'];

        let lineNum: number = 0;

        while (lineNum < document.lineCount) {
            const lineText = document.lineAt(lineNum).text;

            const parts = lineText.split(':');
            if (parts.length !== 2) {
                lineNum++;
                continue;
            }

            const key = parts[0].trim();
            const value = parts[1].trim();

            if (!pathAttributes.includes(key)) {
                lineNum++;
                continue;
            }

            let linkPath: string | undefined = fieldValueToFilePath(value);
            if (!linkPath) {
                lineNum++;
                continue;
            }

            if (!fs.existsSync(linkPath)) {
                const range = new vscode.Range(
                    new vscode.Position(lineNum, lineText.indexOf(value)),
                    new vscode.Position(lineNum, lineText.length)
                );

                const diag = new vscode.Diagnostic(range, 'Config file does not exists', vscode.DiagnosticSeverity.Error);
                diag.code = DIAGNOSTIC_CHECK_CONFIG_EXISTS;

                this.diagnostics.push(diag);
            }

            lineNum++;
        }

        diagnosticsCollection.set(document.uri, this.diagnostics);
    }
}

function fieldValueToFilePath(value: string): string | undefined {
    if (value.startsWith('$')) {
        return pluginsPath(value.slice(1).split('/').join(path.sep));
    } else if (value.startsWith('~')) {
        return rootPath(value.slice(1).split('/').join(path.sep));
    }
}

function createConfig(document: vscode.TextDocument, range: vscode.Range) {
    const fieldValue = document.getText(range).trim();
    if (fieldValue.length === 0) {
        vscode.window.showErrorMessage('Something goes wrong');
        return;
    }

    const filePath = fieldValueToFilePath(fieldValue);
    if (!filePath) {
        vscode.window.showErrorMessage('Something goes wrong');
        return;
    }

    writeFile(filePath, '');

    vscode.window.showTextDocument(vscode.Uri.file(filePath));
}
