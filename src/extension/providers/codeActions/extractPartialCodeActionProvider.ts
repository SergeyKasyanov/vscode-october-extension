import * as fs from 'fs';
import * as vscode from 'vscode';
import { themesPath } from '../../../helpers/paths';
import { ThemeFileUtils } from '../../../helpers/themeFileUtils';
import { writeFile } from '../../../helpers/writeFile';
import { Themes } from '../../../services/themes';
import { Theme } from '../../../types/theme/theme';
import { ThemeMarkupFile } from '../../../types/theme/themeFile';
import { LineSectionChecks } from '../../helpers/lineSectionChecks';
import path = require('path');
import { regExps } from '../../../helpers/regExps';
import { endianness } from 'os';

export class ExtractPartialCodeActionProvider implements vscode.CodeActionProvider<vscode.CodeAction> {

    private document: vscode.TextDocument | undefined;
    private range: vscode.Range | vscode.Selection | undefined;

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        this.document = document;
        this.range = range;

        if (range.isEmpty) {
            return;
        }

        if (!this.checkFile()) {
            return;
        }

        const startInsideTwigStmt = document.getWordRangeAtPosition(range.start, regExps.twigStatement);
        const endInsideTwigStmt = document.getWordRangeAtPosition(range.end, regExps.twigStatement);

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
            command: ExtractPartialCommand.commandName,
            title: 'Extract partial',
            tooltip: 'This will extract selection to partial and replace it with {% partial %} tag.'
        };

        return [action];
    }

    private checkFile(): boolean {
        if (!Themes.instance.isThemeFile(this.document!.fileName)) {
            return false;
        }

        const thisFile = Themes.instance.getFileByPath(this.document!.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return false;
        }

        const startIn = LineSectionChecks.insideTwigSection(this.document!, this.range!.start);
        const endIn = LineSectionChecks.insideTwigSection(this.document!, this.range!.end);
        if (!startIn || !endIn) {
            return false;
        }

        const parsed = ThemeFileUtils.parseFileName(this.document!.fileName);
        const theme = Themes.instance.getTheme(parsed.theme);
        if (!theme) {
            return false;
        }

        return true;
    }
}

export class ExtractPartialCommand {

    public static readonly commandName = 'command.extractPartial';

    private document: vscode.TextDocument | undefined;
    private selection: vscode.Selection | undefined;
    private theme: Theme | undefined;

    async extractPartial() {

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selections.length !== 1) {
            vscode.window.showWarningMessage('Editor is not opened');
            return;
        }

        this.document = editor.document;
        this.selection = editor.selection;

        if (this.selection.isEmpty) {
            vscode.window.showWarningMessage('Selection is empty');
            return;
        }

        this.detectTheme();

        if (!this.theme) {
            vscode.window.showWarningMessage('Theme is not detected');
            return;
        }

        const partialName = await this.getPartialName();
        if (partialName === undefined) {
            vscode.window.showInformationMessage('Canceled');
            return;
        }

        const partialCode = this.getPartialContent();
        this.savePartial(partialName, partialCode);

        const vars = ThemeFileUtils.getEchoedVars(partialCode);

        let replace = '{% partial \'' + partialName + '\'';
        for (const varName of vars) {
            replace += ' ' + varName + ' = \'\'';
        }
        replace += ' %}';

        let edit = new vscode.WorkspaceEdit();
        edit.replace(this.document!.uri, this.selection, replace);

        vscode.workspace.applyEdit(edit);
    }

    private async getPartialName() {
        return await vscode.window.showInputBox({
            title: 'Partial name',
            placeHolder: 'Enter partial name without extension',
            validateInput: text => {
                const match = text.match(/^[\w+\/\-.]+$/);
                if (!match) {
                    return 'Invalid partial name.';
                }

                if (fs.existsSync(this.getPartialPath(text))) {
                    return 'Partial with this name already exists.';
                }
            }
        });
    }

    private detectTheme() {
        if (!Themes.instance.isThemeFile(this.document!.fileName)) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(this.document!.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const startIn = LineSectionChecks.insideTwigSection(this.document!, this.selection!.start);
        const endIn = LineSectionChecks.insideTwigSection(this.document!, this.selection!.end);
        if (!startIn || !endIn) {
            return;
        }

        const parsed = ThemeFileUtils.parseFileName(this.document!.fileName);

        this.theme = Themes.instance.getTheme(parsed.theme);
    }

    private getPartialContent() {
        let selectedTextLines = [];
        let line = this.selection!.start.line;

        while (line <= this.selection!.end.line) {
            let lineText = this.document!.lineAt(line).text;

            if (line === this.selection!.start.line && line === this.selection!.end.line) {
                lineText = lineText.slice(this.selection!.start.character, this.selection!.end.character);
            } else if (line === this.selection!.start.line) {
                lineText = lineText.slice(this.selection!.start.character);
            } else if (line === this.selection!.end.line) {
                lineText = lineText.slice(0, this.selection!.end.character);
            }

            selectedTextLines.push(lineText);
            line++;
        }

        if (this.document!.eol === vscode.EndOfLine.CRLF) {
            return selectedTextLines.join('\r\n');
        }

        return selectedTextLines.join('\n');
    }

    private savePartial(partialName: string, partialCode: string) {
        const normalized = this.getPartialPath(partialName);
        if (fs.existsSync(normalized)) {
            vscode.window.showErrorMessage('Partial with this name already exists.');
        }

        writeFile(normalized, partialCode);
    }

    private getPartialPath(partialName: string) {
        partialName = partialName.replace(/\//g, path.sep) + '.htm';

        return themesPath([this.theme!.name, 'partials', partialName].join(path.sep));
    }
}
