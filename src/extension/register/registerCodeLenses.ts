import * as vscode from "vscode";
import { registerControllerViewLensProvider } from "../providers/codeLenses/controllerViewLensProvider";
import { registerMigrationModelLensProvider } from "../providers/codeLenses/migrationModelLensProvider";
import { registerModelMigrationsLensProvider } from "../providers/codeLenses/modelMigrationsLensProvider";
import { registerThemeFileLinksLensProvider } from "../providers/codeLenses/themeFileLinksLensProvider";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerMigrationModelLensProvider(context);
    registerControllerViewLensProvider(context);
    registerThemeFileLinksLensProvider(context);
}
