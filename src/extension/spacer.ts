/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { Config } from "../config";

const TRIGGERS = ['{', '%', '#'];
const BRACES: { [name: string]: { closed: string, snippet: string } } = {
    '{{': {
        closed: '{{}}',
        snippet: '{{ $0 }}${TM_SELECTED_TEXT/\{\{(\}\}){0,1}//g}'
    },
    '{%': {
        closed: '{%%}',
        snippet: '{% $0 %}${TM_SELECTED_TEXT/\{\%(\%\}){0,1}//g}'
    },
    '{#': {
        closed: '{##}',
        snippet: '{# $0 #}${TM_SELECTED_TEXT/\{\#(\#\}){0,1}//g}'
    },
};

export async function spacer(event: vscode.TextDocumentChangeEvent) {
    if (!Config.isSpacerEnabled) {
        return;
    }

    const autoClosingBrackets = vscode.workspace.getConfiguration('editor').get<string>('autoClosingBrackets');
    if (autoClosingBrackets === 'never') {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.selection.isEmpty) {
        return;
    }

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange || !TRIGGERS.includes(lastChange.text[0])) {
        return;
    }

    const character = lastChange.range.start.character;
    if (character === 0) {
        return;
    }

    const lineText = event.document.lineAt(lastChange.range.start.line).text;
    const brace = lineText.slice(character - 1, character + 1);

    if (!Object.keys(BRACES).includes(brace)) {
        return;
    }

    const isClosed = lineText.slice(character - 1, character + 3) === BRACES[brace].closed;
    const snippet = new vscode.SnippetString(BRACES[brace].snippet);

    const start = lastChange.range.start.translate(0, -1);
    const end = lastChange.range.start.translate(0, isClosed ? 3 : 1);

    const range = new vscode.Range(start, end);

    return editor.insertSnippet(snippet, range);
}
