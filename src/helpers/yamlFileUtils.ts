import * as vscode from "vscode";

export class YamlFileUtils {
    public static getSameLevelPropertyValue(
        document: vscode.TextDocument,
        position: vscode.Position,
        property: string
    ) {
        const value = this.searchProperty(document, position, property, 'up');

        if (value) {
            return value;
        }

        return this.searchProperty(document, position, property, 'down');
    }

    public static getLineIndent(document: vscode.TextDocument, line: number) {
        const match = document.lineAt(line).text.match(/\s*/);

        if (!match || match.index !== 0) {
            return 0;
        }

        return match[0].length;
    }

    private static searchProperty(
        document: vscode.TextDocument,
        position: vscode.Position,
        property: string,
        direction: 'up' | 'down'
    ) {
        const propLineIndent = this.getLineIndent(document, position.line);

        let line = position.line;

        while (direction === 'up' ? line > 0 : line < document.lineCount) {
            const lineIndent = this.getLineIndent(document, line);
            if (lineIndent < propLineIndent) {
                break;
            } else if (lineIndent > propLineIndent) {
                direction === 'up' ? line-- : line++;
                continue;
            }

            const lineParts = document.lineAt(line).text.trim().split(':', 2);
            if (lineParts.length !== 2) {
                direction === 'up' ? line-- : line++;
                continue;
            }

            if (lineParts[0] === property) {
                return lineParts[1].trim();
            }

            direction === 'up' ? line-- : line++;
        }
    }

    public static getKeyAndValue(
        document: vscode.TextDocument,
        line: number
    ) {
        const parts = document.lineAt(line).text.split(':');

        return {
            key: parts[0].trim(),
            value: parts[1] ? parts[1].trim() : undefined
        };
    }

    public static getParent(
        document: vscode.TextDocument,
        line: number
    ) {
        const indent = this.getLineIndent(document, line);

        while (line > 0) {
            line--;

            if (this.getLineIndent(document, line) < indent) {
                return document.lineAt(line).text.split(':')[0].trim();
            }
        }
    }
}
