import * as vscode from "vscode";
import { registerBehaviorsConfigsCheck } from "../providers/diagnostics/check-behaviors-configs";
import { registerFileLinkChecks } from "../providers/diagnostics/check-linked-file-existence";
import { registerModelTraitConfigsCheck } from "../providers/diagnostics/check-models-traits-configs";
import { registerSelectableOptionsExistenceChecks } from "../providers/diagnostics/check-selectable-options-existence";
import { registerThemeFileExistenceChecks } from "../providers/diagnostics/check-theme-file-existence";
import { registerViewChecks } from "../providers/diagnostics/check-view-existence";
import { registerBehaviorConfigFileCheck } from "../providers/diagnostics/check-behavior-config-file";
import { registerMakePartialPathChecks } from "../providers/diagnostics/check-make-partial-path";

export function registerDiagnostics(context: vscode.ExtensionContext): void {
    registerBehaviorConfigFileCheck(context);
    registerBehaviorsConfigsCheck(context);
    registerFileLinkChecks(context);
    registerMakePartialPathChecks(context);
    registerModelTraitConfigsCheck(context);
    registerSelectableOptionsExistenceChecks(context);
    registerThemeFileExistenceChecks(context);
    registerViewChecks(context);
}
