import * as vscode from 'vscode';
import { splitFrontendFile } from '../../helpers/splitFrontendFile';

export class LineSectionChecks {
    public static insideFileConfigSection(
        document: vscode.TextDocument,
        position: vscode.Position,
    ) {
        const sections = splitFrontendFile(document.getText());
        if (sections.length < 2) {
            return false;
        }

        let line = 0;
        let firstComponentLine: number | undefined;
        let iniSectionEndLine: number | undefined;

        while (line < document.lineCount) {
            if (iniSectionEndLine) {
                break;
            }

            const lineText = document.lineAt(line).text;

            if (!firstComponentLine && lineText.trim().startsWith('[')) {
                firstComponentLine = line;

                line++;
                continue;
            }

            if (!iniSectionEndLine && lineText === '==') {
                iniSectionEndLine = line;
                break;
            }

            line++;
        }

        // what???
        if (!iniSectionEndLine) {
            return false;
        }

        if ((firstComponentLine && position.line > firstComponentLine) || position.line > iniSectionEndLine) {
            return false;
        }

        return true;
    }

    public static insidePhpSection(
        document: vscode.TextDocument,
        position: vscode.Position,
    ) {
        let sectionDelimiters: number[] = [];
        let line = 0;

        while (line < document!.lineCount) {
            if (document!.lineAt(line).text === '==') {
                sectionDelimiters.push(line);
            }

            if (sectionDelimiters.length === 2) {
                break;
            }

            line++;
        }

        if (sectionDelimiters.length < 2) {
            return false;
        }

        return position.line >= sectionDelimiters[0] && position.line <= sectionDelimiters[1];
    }

    public static insideTwigSection(
        document: vscode.TextDocument,
        position: vscode.Position,
    ) {
        let sectionDelimiters: number = 0;
        let lastSectionStart: number = 0;
        let line = 0;

        while (line < document.lineCount) {
            if (document.lineAt(line).text === '==') {
                sectionDelimiters++;
                lastSectionStart = line;
            }

            if (sectionDelimiters === 2) {
                break;
            }

            line++;
        }

        return position.line >= lastSectionStart;
    }
}
