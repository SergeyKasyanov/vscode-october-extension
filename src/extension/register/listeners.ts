import * as vscode from "vscode";
import { spacer } from "../spacer";

export function registerListeners(context: vscode.ExtensionContext) {
    useSpacer(context);
    htmlOnEnter();
}

function useSpacer(context: vscode.ExtensionContext) {
    // Auto insert spaces in twig statements
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => spacer(e)));
}

function htmlOnEnter() {
    vscode.languages.setLanguageConfiguration('october-tpl', {
        onEnterRules: [
            {
                beforeText: /\<\w+(\s*[\w+\-]+\=.*?)*?\>/,
                afterText: /\<\/\w+\>/,
                action: {
                    indentAction: vscode.IndentAction.IndentOutdent,
                }
            }
        ]
    });
}
