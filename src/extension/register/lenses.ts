import * as vscode from "vscode";
import { registerControllerViewLensProvider } from "../providers/lenses/controller-view";
import { registerMigrationModelLensProvider } from "../providers/lenses/migration-models";
import { registerModelMigrationsLensProvider } from "../providers/lenses/model-migrations";
import { registerThemeFileLinksLensProvider } from "../providers/lenses/theme-file-usages";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerMigrationModelLensProvider(context);
    registerControllerViewLensProvider(context);
    registerThemeFileLinksLensProvider(context);
}
