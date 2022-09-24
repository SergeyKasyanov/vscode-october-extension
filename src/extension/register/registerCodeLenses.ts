import * as vscode from "vscode";
import { registerControllerViewLensProvider } from "../providers/codeLenses/controllerViewLensProvider";
import { registerModelMigrationsLensProvider } from "../providers/codeLenses/modelMigrationsLensProvider";
import { registerThemeFileLinksLensProvider } from "../providers/codeLenses/themeFileLinksLensProvider";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerControllerViewLensProvider(context);
    registerThemeFileLinksLensProvider(context);
}
