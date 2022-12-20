import * as vscode from "vscode";

/**
 * Helpers for work with yaml files
 */
export class YamlHelpers {
    /**
     * Returns key and value of line (only one-line values)
     *
     * @param lineText
     * @returns
     */
    static getKeyAndValue(lineText: string): { key: string; value?: string; } {
        const parts = lineText.split(':');

        return {
            key: parts[0].trim(),
            value: parts[1] ? parts[1].trim() : undefined
        };
    }

    /**
     * Returns parent name of key on current line
     *
     * @param document
     * @param line
     * @returns
     */
    static getParent(document: vscode.TextDocument, line: number): string | undefined {
        const indent = this.getLineIndent(document, line);

        while (line > 0) {
            line--;

            if (this.getLineIndent(document, line) < indent) {
                return this.getKeyAndValue(document.lineAt(line).text).key;
            }
        }
    }

    /**
     * Return line with parent element
     *
     * @param document
     * @param line
     * @returns
     */
    static getParentLine(document: vscode.TextDocument, line: number): number | undefined {
        const indent = this.getLineIndent(document, line);

        while (line > 0) {
            line--;

            if (this.getLineIndent(document, line) < indent) {
                return line;
            }
        }
    }

    /**
     * Returns another property of same parent
     *
     * @param document
     * @param position
     * @param property
     * @returns
     */
    static getSameParentProperty(document: vscode.TextDocument, position: vscode.Position, property: string): string | undefined {
        return this._getSameParentProperty(document, position, property, 'up')
            || this._getSameParentProperty(document, position, property, 'down');
    }

    /**
     * Returns another property of same parent
     *
     * @param document
     * @param position
     * @param property
     * @param direction
     * @returns
     */
    private static _getSameParentProperty(
        document: vscode.TextDocument,
        position: vscode.Position,
        property: string,
        direction: 'up' | 'down'
    ): string | undefined {
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

    /**
     * Returns indent level of line
     *
     * @param document
     * @param line
     * @returns
     */
    private static getLineIndent(document: vscode.TextDocument, line: number): number {
        const match = document.lineAt(line).text.match(/\s*/);

        return !match || match.index !== 0
            ? 0
            : match[0].length;
    }
}
