import * as vscode from "vscode";
import { addModelAttributes } from "../commands/add-model-attributes";
import { runGenerator } from "../commands/generate";
import { openClass } from "../commands/open-class";
import { openController } from "../commands/open-controller";
import { openLogFile } from "../commands/open-log-file";
import { openModel } from "../commands/open-model";
import { openPlugin } from "../commands/open-plugin-registration-file";
import { openVersionYaml } from "../commands/open-plugin-version-file";
import { openRelatedFile } from "../commands/open-related-file";

export function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.generate', runGenerator));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.addModelAttributesToConfig', addModelAttributes));

    navigationCommands(context);
}

function navigationCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToPlugin', openPlugin));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToVersionYaml', openVersionYaml));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToRelatedFile', openRelatedFile));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToClass', openClass));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToController', openController));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToModel', openModel));
    context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToLogFile', openLogFile));
}
