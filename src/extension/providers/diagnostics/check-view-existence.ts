import * as vscode from "vscode";
import { Project } from "../../../domain/entities/project";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { Store } from "../../../domain/services/store";
import { octoberTplSelector, phpSelector, yamlSelector } from "../../helpers/file-selectors";
import { resolveBaseViewPath, resolveViewPath } from "../../helpers/view-path-resolver";
import { YamlHelpers } from "../../helpers/yaml-helpers";

const DIAGNOSTIC_CHECK_VIEW_EXISTS = 'diagnostic.checkViewExists';
const COMMAND_CREATE_VIEW = 'command.createView';

const PATH_VIEW_PAIR = /path:\s*[\'\"]{0,1}[\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]{0,1}/g;
const MAIL_SEND = /::send\s*\(\s*[\'\"][\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]/g;
const MAIL_SEND_TO = /::sendTo\s*\(\s*.*,\s*[\'\"][\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]/g;
const VIEW_MAKE = /View\s*::\s*make\s*\(\s*[\'\"][\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]/g;
const VIEW_FUNC = /view\s*\(\s*[\'\"][\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]/g;
const QUOTED_TEMPLATE_NAME = /[\'\"][\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]/;

/**
 * Check if view exists
 *
 * @param context
 */
export function registerViewChecks(context: vscode.ExtensionContext) {
    const viewExistenceDiagnostics = vscode.languages.createDiagnosticCollection('configLinks');
    context.subscriptions.push(viewExistenceDiagnostics);

    subscribeToDocumentChange(context, viewExistenceDiagnostics);

    const selectors = [yamlSelector, phpSelector, octoberTplSelector];
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(selectors, new CreateViewActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_VIEW, createView));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param viewExistenceDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, viewExistenceDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, viewExistenceDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, viewExistenceDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, viewExistenceDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => viewExistenceDiagnostics.delete(doc.uri)));
}

/**
 * Check if view exists
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection
) {
    const project = Store.instance.findProject(document.fileName);
    if (!project) {
        return;
    }

    if (document.fileName.endsWith('.yaml')) {
        provideDiagnosticsForYaml(document, diagnosticsCollection, project);
        return;
    }

    if (document.fileName.endsWith('.php')) {
        provideDiagnosticsForPhp(document, diagnosticsCollection, project);
        return;
    }

    const entity = Store.instance.findEntity(document.fileName);
    if (entity instanceof MarkupFile) {
        provideDiagnosticsForPhp(document, diagnosticsCollection, project);
        return;
    }
}

/**
 * Check if view used in yaml cofnig exists
 *
 * @param document
 * @param diagnosticsCollection
 * @param project
 */
function provideDiagnosticsForYaml(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection,
    project: Project
) {
    const diagnostics: Diagnostic[] = [];

    const matches = document.getText().matchAll(PATH_VIEW_PAIR);
    for (const match of matches) {
        const line = document.positionAt(match.index!).line;
        const lineText = document.lineAt(line).text;

        const value = YamlHelpers.getKeyAndValue(lineText).value;
        if (!value) {
            continue;
        }

        const diag = createDiagnostic(project, line, lineText, value, '.php');
        if (diag) {
            diagnostics.push(diag);
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Check if view used in making view or mail exists
 *
 * @param document
 * @param diagnosticsCollection
 * @param project
 */
function provideDiagnosticsForPhp(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection,
    project: Project
) {
    const diagnostics: Diagnostic[] = [];

    [
        MAIL_SEND,
        MAIL_SEND_TO,
        VIEW_MAKE,
        VIEW_FUNC,
    ].forEach(regexp => {
        const matches = document.getText().matchAll(regexp);
        for (const match of matches) {
            const line = document.positionAt(match.index!).line;
            const lineText = document.lineAt(line).text;

            const viewMatch = lineText.match(QUOTED_TEMPLATE_NAME);
            const view = viewMatch![0].slice(1, -1);

            const diag = createDiagnostic(project, line, lineText, view, '.htm');
            if (diag) {
                diagnostics.push(diag);
            }
        }
    });

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Create diagnostic
 *
 * @param project
 * @param line
 * @param lineText
 * @param view
 * @param ext
 * @returns
 */
function createDiagnostic(
    project: Project,
    line: number,
    lineText: string,
    view: string,
    ext: string
) {
    // resolve already checked file existence
    const viewPath = resolveViewPath(project, view);
    if (viewPath) {
        return;
    }

    const start = new vscode.Position(line, lineText.indexOf(view));
    const end = start.translate(0, view.length);
    const range = new vscode.Range(start, end);

    const diag = new Diagnostic(range, 'View does not exists', vscode.DiagnosticSeverity.Error);
    diag.code = DIAGNOSTIC_CHECK_VIEW_EXISTS;
    diag.filePath = resolveBaseViewPath(project, view) + ext;

    return diag;
}

/**
 * Provides command for create not existing file
 */
class CreateViewActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code?.toString() === DIAGNOSTIC_CHECK_VIEW_EXISTS)
            .map(diagnostic => {
                const action = new vscode.CodeAction('Create view', vscode.CodeActionKind.QuickFix);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: COMMAND_CREATE_VIEW,
                    title: 'Create view',
                    arguments: [diagnostic]
                };

                return action;
            });
    }
}

/**
 * Create not existing view
 *
 * @param diagnostic
 */
function createView(diagnostic: Diagnostic) {
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
