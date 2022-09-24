import path = require("path");
import * as vscode from "vscode";
import { octoberTplSelector } from "../../../helpers/fileSelectors";
import { themesPath } from "../../../helpers/paths";
import { regExps } from "../../../helpers/regExps";
import { splitFrontendFile } from "../../../helpers/splitFrontendFile";
import { ThemeFileUtils } from "../../../helpers/themeFileUtils";
import { writeFile } from "../../../helpers/writeFile";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";

const DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE = 'diagnostic.checkLayoutExistence';
const DIAGNOSTIC_CHECK_PAGE_EXISTENCE = 'diagnostic.checkPageExistence';
const DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE = 'diagnostic.checkPartialExistence';
const DIAGNOSTIC_CHECK_CONTENT_EXISTENCE = 'diagnostic.checkContentExistence';

const COMMAND_CREATE_LAYOUT = 'command.createLayout';
const COMMAND_CREATE_PAGE = 'command.createPage';
const COMMAND_CREATE_PARTIAL = 'command.createPartial';
const COMMAND_CREATE_CONTENT = 'command.createContent';

enum TYPE { layout, page, partial, content };

let themeFilesExistenceDiagnostics: vscode.DiagnosticCollection;

export function registerThemeFileExistenceChecks(context: vscode.ExtensionContext) {
    themeFilesExistenceDiagnostics = vscode.languages.createDiagnosticCollection('themeFileExistenceChecks');
    context.subscriptions.push(themeFilesExistenceDiagnostics);

    subscribeToDocumentChange(context, themeFilesExistenceDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(octoberTplSelector, new CreateThemeFileActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_LAYOUT, (document, range) => createFile(TYPE.layout, document, range)));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_PAGE, (document, range) => createFile(TYPE.page, document, range)));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_PARTIAL, (document, range) => createFile(TYPE.partial, document, range)));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_CREATE_CONTENT, (document, range) => createFile(TYPE.content, document, range)));
}

function subscribeToDocumentChange(context: vscode.ExtensionContext, themeFilesExistenceDiagnostics: vscode.DiagnosticCollection) {
    const checkTraitsConfigs = new CheckThemeFileExistence();

    if (vscode.window.activeTextEditor) {
        checkTraitsConfigs.provideDiagnostics(vscode.window.activeTextEditor.document, themeFilesExistenceDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            checkTraitsConfigs.provideDiagnostics(editor.document, themeFilesExistenceDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => checkTraitsConfigs.provideDiagnostics(editor.document, themeFilesExistenceDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => themeFilesExistenceDiagnostics.delete(doc.uri)));
}

class CreateThemeFileActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return context.diagnostics
            .filter(d => {
                const code = d.code?.toString();
                return code && [
                    DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE,
                    DIAGNOSTIC_CHECK_PAGE_EXISTENCE,
                    DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE,
                    DIAGNOSTIC_CHECK_CONTENT_EXISTENCE,
                ].includes(code);
            })
            .map(d => this.createCodeAction(document, d));
    }

    private createCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        let title, command;
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
            default:
                throw Error('Unknown diagnostic');
        }

        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.command = { command, title, arguments: [document, diagnostic.range] };

        return action;
    }
}

class CheckThemeFileExistence {

    private document: vscode.TextDocument | undefined;
    private diagnostics: vscode.Diagnostic[] = [];

    provideDiagnostics(
        document: vscode.TextDocument,
        diagnosticsCollection: vscode.DiagnosticCollection
    ) {
        if (!Themes.instance.isThemeFile(document.fileName)) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        this.document = document;

        this.diagnostics = [];

        try {
            this.fillDiagnostics();
        } catch (err) {
            console.error(err);
        }

        diagnosticsCollection.set(document.uri, this.diagnostics);
    }

    private fillDiagnostics() {
        let iniSection, twigSection, twigSectionOffset;

        const sections = splitFrontendFile(this.document!.getText());
        if (sections.length === 0) {
            return;
        } else if (sections.length === 1) {
            twigSectionOffset = 0;
            twigSection = sections[0];
        } else if (sections.length === 2) {
            iniSection = sections[0];
            twigSectionOffset = iniSection.length + 4;
            twigSection = sections[1];
        } else {
            iniSection = sections[0];
            twigSectionOffset = iniSection.length + sections[1].length + 8;
            twigSection = sections[2];
        }

        const parsedFileName = ThemeFileUtils.parseFileName(this.document!.fileName);
        if (!parsedFileName) {
            return;
        }

        const theme = Themes.instance.getTheme(parsedFileName.theme);
        if (!theme) {
            return;
        }

        if (iniSection) {
            const layoutPropMatch = iniSection.match(regExps.layoutPropertySearch);
            if (layoutPropMatch && layoutPropMatch.index) {
                const val = layoutPropMatch[0].split('=')[1].trim().slice(1, -1);
                if (!theme.getLayout(val)) {
                    const pos = this.document!.positionAt(layoutPropMatch.index + layoutPropMatch[0].indexOf(val));

                    this.diagnostics.push(this.createDiagnostic(TYPE.layout, pos, val));
                }
            }
        }

        if (twigSection) {
            const partialTagMatches = twigSection.matchAll(regExps.partialTagGlobal);
            for (const match of partialTagMatches) {
                const val = match[0].split('{% partial')[1].trim().slice(1, -1);
                if (!theme.getPartial(val)) {
                    const pos = this.document!.positionAt(twigSectionOffset + match.index! + match[0].indexOf(val));

                    this.diagnostics.push(this.createDiagnostic(TYPE.partial, pos, val));
                }
            }

            const contentTagMatches = twigSection.matchAll(regExps.contentTagGlobal);
            for (const match of contentTagMatches) {
                const val = match[0].split('{% content')[1].trim().slice(1, -1);
                let contentFileName = val;
                if (!contentFileName.includes('.')) {
                    contentFileName += '.htm';
                }
                if (!theme.getContent(contentFileName)) {
                    const pos = this.document!.positionAt(twigSectionOffset + match.index! + match[0].indexOf(val));

                    this.diagnostics.push(this.createDiagnostic(TYPE.content, pos, val));
                }
            }

            const pageFilteredStringMatches = twigSection.matchAll(regExps.pageFilteredStringGlobal);
            for (const match of pageFilteredStringMatches) {
                const val = match[0].match(regExps.pageName)![0].slice(1, -1);
                if (!theme.getPage(val)) {
                    const pos = this.document!.positionAt(twigSectionOffset + match.index! + match[0].indexOf(val));

                    this.diagnostics.push(this.createDiagnostic(TYPE.page, pos, val));
                }
            }
        }
    }

    private createDiagnostic(type: TYPE, pos: vscode.Position, val: string): vscode.Diagnostic {
        const range = new vscode.Range(pos, pos.translate(0, val.length));

        let message, code;
        switch (type) {
            case TYPE.layout:
                message = 'Layout';
                code = DIAGNOSTIC_CHECK_LAYOUT_EXISTENCE;
                break;
            case TYPE.page:
                message = 'Page';
                code = DIAGNOSTIC_CHECK_PAGE_EXISTENCE;
                break;
            case TYPE.partial:
                message = 'Partial';
                code = DIAGNOSTIC_CHECK_PARTIAL_EXISTENCE;
                break;
            case TYPE.content:
                message = 'Content';
                code = DIAGNOSTIC_CHECK_CONTENT_EXISTENCE;
                break;
        }

        message += ` "${val}" does not exists.`;

        const diag = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        diag.code = code;

        return diag;
    }
}

async function createFile(type: TYPE, document: vscode.TextDocument, range: vscode.Range) {
    const name = document.getText(range);

    const parsedFileName = ThemeFileUtils.parseFileName(document.fileName);
    if (!parsedFileName) {
        vscode.window.showErrorMessage('Create file error');
        return;
    }

    let filePath, fileContent;
    switch (type) {
        case TYPE.layout:
            filePath = themesPath([parsedFileName.theme, 'layouts', name.replace(/\//g, path.sep)].join(path.sep) + '.htm');
            fileContent = `##
description = "\${1:${name} layout}"
==
{% page %}
$0
`;
            break;
        case TYPE.page:
            filePath = themesPath([parsedFileName.theme, 'pages', name.replace(/\//g, path.sep)].join(path.sep) + '.htm');
            fileContent = `##
url = "$1"
layout = "$2"
description = "\${3:${name} page}"
==
$0
`;
            break;
        case TYPE.partial:
            filePath = themesPath([parsedFileName.theme, 'partials', name.replace(/\//g, path.sep)].join(path.sep) + '.htm');
            fileContent = `##
description = "\${1:${name} partial}"
==
$0
`;
            break;
        case TYPE.content:
            filePath = themesPath([parsedFileName.theme, 'content', name.replace(/\//g, path.sep)].join(path.sep) + (name.includes('.') ? '' : '.htm'));
            fileContent = `$0`;
            break;
    }

    writeFile(filePath, '');

    const editor = await vscode.window.showTextDocument(vscode.Uri.file(filePath));
    editor.insertSnippet(
        new vscode.SnippetString(fileContent)
    );
}
