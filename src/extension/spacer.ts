import * as vscode from "vscode";

const CONFIG = {
    triggers: [
        '{',
        '%',
        '#',
    ],
    braces: [
        '{{',
        '{%',
        '{#',
    ],
    expressions: [
        /\{\{.*\}\}/,
        /\{\%.*\%\}/,
        /\{\#.*\#\}/,
    ]
};

export async function spacer(event: vscode.TextDocumentChangeEvent) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    if (!editor.selection.isEmpty) {
        return;
    }

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange) {
        return;
    }

    if (!CONFIG.triggers.includes(lastChange.text[0])) {
        return;
    }

    const character = lastChange.range.start.character;
    if (character === 0) {
        return;
    }

    const lineText = event.document.lineAt(lastChange.range.start.line).text;
    const twoSymbols = lineText.slice(character - 1, character + 1);

    const braceIndex = CONFIG.braces.indexOf(twoSymbols);
    if (braceIndex === -1) {
        return;
    }

    const brace = CONFIG.braces[CONFIG.braces.indexOf(twoSymbols)];
    const range = new vscode.Range(lastChange.range.start.translate(0, -1), lastChange.range.start.translate(0, 5));

    switch (brace) {
        case '{{':
            return editor.insertSnippet(new vscode.SnippetString('{{ $0 }}${TM_SELECTED_TEXT/\{\{\}\}//g}'), range);
        case '{%':
            return editor.insertSnippet(new vscode.SnippetString('{% $0 %}${TM_SELECTED_TEXT/\{\%\}//g}'), range);
        case '{#':
            return editor.insertSnippet(new vscode.SnippetString('{# $0 #}${TM_SELECTED_TEXT/\{\#\}//g}'), range);
    }
}
