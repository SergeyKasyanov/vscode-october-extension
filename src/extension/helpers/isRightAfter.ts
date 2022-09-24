import * as vscode from "vscode";

const LINES_FOR_SEARCH = 30;

/**
 * @param document Document to search inside
 * @param position Current position
 * @param what Right after what? Single-line regex.
 * @param spacer strings identifies as spaces
 */
export function isRightAfter(
    document: vscode.TextDocument,
    position: vscode.Position,
    what: RegExp,
    spacer: RegExp,
): boolean {
    let stopLine = position.line - LINES_FOR_SEARCH;
    if (stopLine < 0) {
        stopLine = 0;
    }

    let character = position.character;

    const wordRange = document.getWordRangeAtPosition(position);
    if (wordRange) {
        character = position.character - (wordRange.end.character - wordRange.start.character);
    }

    let line: number = position.line;
    let stringsBetween: string[] = [];

    let found;
    while (line >= stopLine) {
        const lineText = document.lineAt(line).text;

        for (const match of lineText.matchAll(what)) {
            if (line === position.line && (match.index! + match[0].length) > character) {
                break;
            }

            found = match;
        }

        let newString;

        if (found) {
            const foundIndex = found.index!;

            if (line === position.line) {
                // line is current, but we are still before "what" (how did we get here?)
                if (foundIndex > character) {
                    return false;
                }

                newString = lineText.slice(foundIndex + found[0].length, character);
            } else {
                newString = lineText.slice(foundIndex + found[0].length);
            }
        } else {
            if (line === position.line) {
                newString = lineText.slice(0, character);
            } else {
                newString = lineText;
            }
        }

        stringsBetween.push(newString);

        if (found) {
            break;
        }

        line--;
    }

    if (!found) {
        return false;
    }

    const textBetween = stringsBetween.reverse().join('\n');

    return spacer.test(textBetween);
}

export function searchAfter(
    document: vscode.TextDocument,
    position: vscode.Position,
    what: RegExp
): vscode.Position | undefined {
    let line = position.line;

    while (line < document.lineCount) {
        const lineText = document.lineAt(line).text;

        const match = lineText.match(what);
        if (match) {
            return new vscode.Position(line, match.index!);
        }

        line++;
    }

    return;
}
