import * as vscode from 'vscode';
import { Theme } from '../../../domain/entities/owners/theme';
import { MarkupFile } from '../../../domain/entities/theme/theme-file';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { octoberTplSelector } from '../../helpers/file-selectors';
import path = require('path');

const COMMAND_EXTRACT_PARTIAL = 'command.extractPartial';

export function registerExtractPartialAction(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(octoberTplSelector, new ExtractPartial));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_EXTRACT_PARTIAL, extractPartial));
}

const TWIG_STATEMENT = /\{[\{\%].*[\}\%]\}/;
const PARTIAL_VAR = /\{\{\s*\w+/g;

/**
 * Command for extract selected code to partial in theme markup files
 */
export class ExtractPartial implements vscode.CodeActionProvider<vscode.CodeAction> {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        if (range.isEmpty) {
            return;
        }

        const markupFile = Store.instance.findEntity(document.fileName);
        if (!(markupFile instanceof MarkupFile)) {
            return;
        }

        const startOffset = document.offsetAt(range.start);
        const endOffset = document.offsetAt(range.end);

        if (!markupFile.isOffsetInsideTwig(startOffset)
            || !markupFile.isOffsetInsideTwig(endOffset)
        ) {
            return;
        }

        const startInsideTwigStmt = document.getWordRangeAtPosition(range.start, TWIG_STATEMENT);
        const endInsideTwigStmt = document.getWordRangeAtPosition(range.end, TWIG_STATEMENT);

        if (startInsideTwigStmt || endInsideTwigStmt) {
            const startWithTwigStmt = startInsideTwigStmt && !endInsideTwigStmt
                && range.start.isEqual(startInsideTwigStmt.start);

            const endWithTwigStmt = !startInsideTwigStmt && endInsideTwigStmt
                && range.end.isEqual(endInsideTwigStmt.end);

            const currentRangeIsTwigStmt = startInsideTwigStmt && endInsideTwigStmt
                && range.start.isEqual(startInsideTwigStmt.start)
                && range.end.isEqual(endInsideTwigStmt.end);

            if (!(startWithTwigStmt || endWithTwigStmt || currentRangeIsTwigStmt)) {
                return;
            }
        }

        const action = new vscode.CodeAction('Extract partial', vscode.CodeActionKind.RefactorExtract);
        action.command = {
            command: COMMAND_EXTRACT_PARTIAL,
            title: 'Extract partial',
            tooltip: 'This will extract selection to partial and replace it with {% partial %} tag.',
            arguments: [document, range, markupFile]
        };

        return [action];
    }
}

async function extractPartial(
    document: vscode.TextDocument,
    range: vscode.Range,
    markupFile: MarkupFile
): Promise<void> {
    const partialName = await getPartialName(markupFile.owner);
    if (!partialName) {
        return;
    }

    const partialContent = savePartial(document, range, markupFile, partialName);

    replaceRange(document, range, partialName, partialContent);
}

function replaceRange(
    document: vscode.TextDocument,
    range: vscode.Range,
    partialName: string,
    partialContent: string,
): void {
    const vars: string[] = [];
    const variablesMatches = partialContent.matchAll(PARTIAL_VAR);
    for (const match of variablesMatches) {
        const varName = match[0].replace(/\{\{\s*/, '').trim();
        if (!vars.includes(varName)) {
            vars.push(varName);
        }
    }

    let replace = '{% partial \'' + partialName + '\'';
    for (const varName of vars) {
        replace += ' ' + varName + ' = \'\'';
    }
    replace += ' %}';

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, replace);

    vscode.workspace.applyEdit(edit);
}

async function getPartialName(theme: Theme): Promise<string | undefined> {
    return await vscode.window.showInputBox({
        title: 'Partial name',
        placeHolder: 'Enter partial name without extension',
        validateInput: text => {
            if (!text.match(/^[\w+\/\-.]+$/)) {
                return 'Invalid partial name.';
            }

            if (theme.partials.find(p => p.name === text)) {
                return 'Partial with this name already exists.';
            }
        }
    });
}

function savePartial(
    document: vscode.TextDocument,
    range: vscode.Range,
    markupFile: MarkupFile,
    partialName: string
): string {
    const partialPath = path.join(markupFile.owner.path, 'partials', ...partialName.split('/')) + '.htm';
    const partialContent = document.getText().slice(
        document.offsetAt(range.start),
        document.offsetAt(range.end)
    );

    FsHelpers.writeFile(partialPath, partialContent);

    return partialContent;
}
