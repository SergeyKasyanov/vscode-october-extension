import * as vscode from "vscode";
import { registerBehaviorsConfigsCheck } from "../providers/diagnostics/checkBehaviorsConfigs";
import { registerFileLinkChecks } from "../providers/diagnostics/checkLinkedFileExistence";
import { registerThemeFileExistenceChecks } from "../providers/diagnostics/checkThemeFileExistence";
import { registerTraitsConfigsChecks } from "../providers/diagnostics/checkTraitsConfigs";

export function registerDiagnostics(context: vscode.ExtensionContext): void {
    registerTraitsConfigsChecks(context);
    registerBehaviorsConfigsCheck(context);
    registerThemeFileExistenceChecks(context);
    registerFileLinkChecks(context);
}
