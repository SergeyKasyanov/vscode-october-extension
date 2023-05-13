import * as vscode from "vscode";
import { addModelAttributes } from "../commands/add-model-attributes";
import { runGenerator } from "../commands/generate";
import { generatePhpStormMeta } from "../commands/generate-phpstorm-meta";
import { openBlueprint } from "../commands/open-blueprint";
import { openClass } from "../commands/open-class";
import { openController } from "../commands/open-controller";
import { openLogFile } from "../commands/open-log-file";
import { openModel } from "../commands/open-model";
import { openPlugin } from "../commands/open-plugin-registration-file";
import { openVersionYaml } from "../commands/open-plugin-version-file";
import { openRelatedFile } from "../commands/open-related-file";

export function registerCommands(context: vscode.ExtensionContext): void {
    register(context, 'octoberCode.generate', runGenerator);
    register(context, 'octoberCode.addModelAttributesToConfig', addModelAttributes);
    register(context, 'octoberCode.generatePhpstormMeta', generatePhpStormMeta);

    navigationCommands(context);
}

function navigationCommands(context: vscode.ExtensionContext): void {
    register(context, 'octoberCode.goToPlugin', openPlugin);
    register(context, 'octoberCode.goToVersionYaml', openVersionYaml);
    register(context, 'octoberCode.goToRelatedFile', openRelatedFile);
    register(context, 'octoberCode.goToClass', openClass);
    register(context, 'octoberCode.goToController', openController);
    register(context, 'octoberCode.goToModel', openModel);
    register(context, 'octoberCode.goToLogFile', openLogFile);
    register(context, 'octoberCode.goToBlueprint', openBlueprint);
}

function register(
    context: vscode.ExtensionContext,
    code: string,
    handler: (...args: any[]) => any
): void {
    context.subscriptions.push(vscode.commands.registerCommand(code, handler));
}
