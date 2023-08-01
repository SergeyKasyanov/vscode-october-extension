import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { octoberTplSelector } from "../../helpers/file-selectors";
import path = require("path");

const DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE = 'diagnostic.checkLayoutExistence';
const DIAGNOSTIC_CHECK_PAGE_EXISTENCE = 'diagnostic.checkPageExistence';
const DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE = 'diagnostic.checkPartialExistence';
const DIAGNOSTIC_CHECK_CONTENT_EXISTENCE = 'diagnostic.checkContentExistence';

const COMMAND_CREATE_LAYOUT = 'command.createLayout';
const COMMAND_CREATE_PAGE = 'command.createPage';
const COMMAND_CREATE_PARTIAL = 'command.createPartial';
const COMMAND_CREATE_CONTENT = 'command.createContent';

const LAYOUT_PROPERTY = /layout\s*\=\s*[\'\"]{0,1}\w+[\'\"]{0,1}/g;

const PAGE_URL = /->\s*pageUrl\s*\(\s*[\'\"][\w\_\-\/\.]+[\'\"]/g;
const PAGE_STR = /[\'\"][\w\_\-\/\.]+[\'\"]\s*\|\s*page/g;
const PAGE_NAME = /[\'\"][\w\_\-\/\.]+[\'\"]/g;

const PARTIAL_TAG = /\{\%\s*partial\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PARTIAL_FUNC = /((\{\{)|=)\s*partial\s*\(\s*[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PARTIAL_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

const CONTENT_TAG = /\{\%\s*content\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const CONTENT_FUNC = /((\{\{)|=)\s*content\s*\([\'\"][\w\-\_\/\.]+[\'\"]/g;
const CONTENT_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

type FileType = 'layout' | 'page' | 'partial' | 'content';

/**
 * Register check theme file existence diagnostic
 *
 * @param context
 */
export function registerThemeFileExistenceChecks(context: vscode.ExtensionContext) {
    const themeFilesExistenceDiagnostics = vscode.languages.createDiagnosticCollection('themeFileExistence');
    context.subscriptions.push(themeFilesExistenceDiagnostics);

    subscribeToDocumentChange(context, themeFilesExistenceDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(octoberTplSelector, new CreateThemeFileActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_LAYOUT, createFile));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_PAGE, createFile));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_PARTIAL, createFile));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_CONTENT, createFile));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param themeFilesExistenceDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, themeFilesExistenceDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, themeFilesExistenceDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, themeFilesExistenceDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, themeFilesExistenceDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => themeFilesExistenceDiagnostics.delete(doc.uri)));
}

/**
 * Check if files used in theme file exists
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection
): void {
    const entity = Store.instance.findEntity(document.fileName);
    if (!(entity instanceof MarkupFile)) {
        return;
    }

    const diagnostics: Diagnostic[] = [];

    const layoutMatches = [...document.getText().matchAll(LAYOUT_PROPERTY)];
    if (layoutMatches.length) {
        const layoutMatch = layoutMatches[0];

        const position = document.positionAt(layoutMatch.index!);
        const lineText = document.lineAt(position.line).text;
        const layoutName = lineText.split('=')[1].trim().slice(1, -1);

        const layout = entity.owner.layouts.find(l => l.name === layoutName);
        if (!layout) {
            const start = new vscode.Position(position.line, lineText.indexOf(layoutName));
            const end = start.translate(0, layoutName.length);
            const range = new vscode.Range(start, end);

            const diagnostic = new Diagnostic(range, 'Layout file does not exists', vscode.DiagnosticSeverity.Error);
            diagnostic.code = DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE;
            diagnostic.type = 'layout';
            diagnostic.name = layoutName;

            diagnostics.push(diagnostic);
        }
    }

    const pageUrlMatches = [
        ...document.getText().matchAll(PAGE_URL),
        ...document.getText().matchAll(PAGE_STR),
    ];
    for (const match of pageUrlMatches) {
        const pageNameMatch = [...match[0].matchAll(PAGE_NAME)].reverse()[0];
        const pageName = pageNameMatch[0].slice(1, -1);
        const page = entity.owner.pages.find(p => p.name === pageName);

        if (!page) {
            const start = document.positionAt(match.index! + pageNameMatch.index! + 1);
            const end = start.translate(0, pageName.length);
            const range = new vscode.Range(start, end);

            const diagnostic = new Diagnostic(range, 'Page file does not exists', vscode.DiagnosticSeverity.Error);
            diagnostic.code = DIAGNOSTIC_CHECK_PAGE_EXISTENCE;
            diagnostic.type = 'page';
            diagnostic.name = pageName;

            diagnostics.push(diagnostic);
        }
    }

    const partialsMatches = [
        ...document.getText().matchAll(PARTIAL_TAG),
        ...document.getText().matchAll(PARTIAL_FUNC),
    ];
    for (const match of partialsMatches) {
        const partialNameMatch = match[0].match(PARTIAL_NAME)!;
        const partialName = partialNameMatch[0].slice(1, -1);
        const partial = entity.owner.partials.find(p => p.name === partialName);

        if (!partial) {
            const start = document.positionAt(match.index! + partialNameMatch.index! + 1);
            const end = start.translate(0, partialName.length);
            const range = new vscode.Range(start, end);

            const diagnostic = new Diagnostic(range, 'Partial file does not exists', vscode.DiagnosticSeverity.Error);
            diagnostic.code = DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE;
            diagnostic.type = 'partial';
            diagnostic.name = partialName;

            diagnostics.push(diagnostic);
        }
    }

    const contentsMatches = [
        ...document.getText().matchAll(CONTENT_TAG),
        ...document.getText().matchAll(CONTENT_FUNC),
    ];
    for (const match of contentsMatches) {
        const contentNameMatch = match[0].match(CONTENT_NAME)!;
        let contentName = contentNameMatch[0].slice(1, -1);

        const nameLength = contentName.length;

        if (!contentName.includes('.')) {
            contentName += '.htm';
        }

        const content = entity.owner.contents.find(c => c.name === contentName);

        if (!content) {
            const start = document.positionAt(match.index! + contentNameMatch.index! + 1);
            const end = start.translate(0, nameLength);
            const range = new vscode.Range(start, end);

            const diagnostic = new Diagnostic(range, 'Content file does not exists', vscode.DiagnosticSeverity.Error);
            diagnostic.code = DIAGNOSTIC_CHECK_CONTENT_EXISTENCE;
            diagnostic.type = 'content';
            diagnostic.name = contentName;

            diagnostics.push(diagnostic);
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Provides command for create theme file
 */
class CreateThemeFileActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => {
                const code = diagnostic.code?.toString();
                return code && [
                    DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE,
                    DIAGNOSTIC_CHECK_PAGE_EXISTENCE,
                    DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE,
                    DIAGNOSTIC_CHECK_CONTENT_EXISTENCE,
                ].includes(code);
            })
            .map(diagnostic => {
                let title: string, command: string;
                switch (diagnostic.code) {
                    case DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE:
                        title = 'Create layout';
                        command = COMMAND_CREATE_LAYOUT;
                        break;
                    case DIAGNOSTIC_CHECK_PAGE_EXISTENCE:
                        title = 'Create page';
                        command = COMMAND_CREATE_PAGE;
                        break;
                    case DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE:
                        title = 'Create partial';
                        command = COMMAND_CREATE_PARTIAL;
                        break;
                    case DIAGNOSTIC_CHECK_CONTENT_EXISTENCE:
                        title = 'Create content';
                        command = COMMAND_CREATE_CONTENT;
                        break;
                }

                const action = new vscode.CodeAction(title!, vscode.CodeActionKind.QuickFix);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: command!,
                    title: title!,
                    arguments: [document, diagnostic]
                };

                return action;
            });
    }
}

/**
 * Create theme file
 *
 * @param document
 * @param diagnostic
 * @returns
 */
async function createFile(document: vscode.TextDocument, diagnostic: Diagnostic) {
    const name = diagnostic.name;
    const entity = Store.instance.findEntity(document.fileName);

    let filePath: string, fileContent: string;
    switch (diagnostic.type) {
        case 'layout':
            filePath = PathHelpers.themesPath(entity!.owner!.project.path, path.join(entity!.owner.name, 'layouts', name!.replace(/\//g, path.sep))) + '.htm';
            fileContent = `##
description = "\${1:${name!} layout}"
==
{% page %}
$0
`;
            break;
        case 'page':
            filePath = PathHelpers.themesPath(entity!.owner!.project.path, path.join(entity!.owner.name, 'pages', name!.replace(/\//g, path.sep))) + '.htm';
            fileContent = `##
url = "$1"
layout = "$2"
title = "\${3:${name!} page}"
description = "\${4:${name!} page}"
==
$0
`;
            break;
        case 'partial':
            filePath = PathHelpers.themesPath(entity!.owner!.project.path, path.join(entity!.owner.name, 'partials', name!.replace(/\//g, path.sep))) + '.htm';
            fileContent = `##
description = "\${1:${name!} partial}"
==
$0
`;
            break;
        case 'content':
            filePath = PathHelpers.themesPath(entity!.owner!.project.path, path.join(entity!.owner.name, 'content', name!.replace(/\//g, path.sep)) + (name!.includes('.') ? '' : '.htm'));
            fileContent = `$0`;
            break;
    }

    FsHelpers.writeFile(filePath!, '');

    const editor = await vscode.window.showTextDocument(vscode.Uri.file(filePath!));
    editor.insertSnippet(
        new vscode.SnippetString(fileContent!)
    );
}

class Diagnostic extends vscode.Diagnostic {
    type?: FileType;
    name?: string;
}
