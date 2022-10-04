import * as vscode from "vscode";
import { ControllersDataLoader } from "../../services/project/conrtollersDataLoader";
import { ModelsDataLoader } from "../../services/project/modelsDataLoader";
import { Themes } from "../../services/themes";
import { spacer } from "../spacer";

export function registerListeners(context: vscode.ExtensionContext) {
    useSpacer(context);
    htmlOnEnter();
}

function useSpacer(context: vscode.ExtensionContext) {
    // Auto insert spaces in twig statements
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => spacer(e)));

    // Update files index on type
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (Themes.instance.isThemeFile(e.document.fileName)) {
            return Themes.instance.updateFileData(e.document.fileName, e.document.getText());
        }

        if (ModelsDataLoader.instance.isModelFile(e.document.fileName)) {
            return ModelsDataLoader.instance.loadModel(e.document.fileName, e.document.getText());
        }

        if (ControllersDataLoader.instance.isControllerFile(e.document.fileName)) {
            return ControllersDataLoader.instance.loadController(e.document.fileName, e.document.getText());
        }
    }));
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
