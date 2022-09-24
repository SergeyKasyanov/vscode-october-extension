import * as vscode from "vscode";
import { FillFieldsYaml as AddModelAttributesToConfig } from "../commands/addModelAttributesToConfig";
import { Generate } from "../commands/generate";
import { GoToClass } from "../commands/goToClass";
import { GoToController } from "../commands/goToController";
import { GoToModel } from "../commands/goToModel";
import { GoToPlugin } from "../commands/goToPlugin";
import { GoToRelatedFile } from "../commands/goToRelatedFile";

export function registerCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.generate', () => (new Generate).chooseGenerator()));

    navigationCommands(context);
}

function navigationCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToPlugin', () => (new GoToPlugin).execute()));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToRelatedFile', () => (new GoToRelatedFile).execute()));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToClass', () => (new GoToClass).execute()));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToController', () => (new GoToController).execute()));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToModel', () => (new GoToModel).execute()));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.addModelAttributesToConfig', () => (new AddModelAttributesToConfig).execute()));
}
