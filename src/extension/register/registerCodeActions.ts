import * as vscode from "vscode";
import { octoberTplSelector } from "../../helpers/fileSelectors";
import { ExtractPartialCodeActionProvider, ExtractPartialCommand } from "../providers/codeActions/extractPartialCodeActionProvider";

export function registerCodeActions(context: vscode.ExtensionContext): void {
    extractPartial(context);
}

function extractPartial(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(octoberTplSelector, new ExtractPartialCodeActionProvider));
    context.subscriptions.push(vscode.commands.registerCommand(ExtractPartialCommand.commandName, () => (new ExtractPartialCommand).extractPartial()));
}
