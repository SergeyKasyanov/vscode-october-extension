import * as vscode from "vscode";
import { themeFileSelector } from "../helpers/file-selectors";
import { registerControllerViewLensProvider } from "../providers/lenses/controller-view";
import { registerMigrationModelLensProvider } from "../providers/lenses/migration-models";
import { registerMigrationVersionLensProvider } from "../providers/lenses/migration-version";
import { registerModelMigrationsLensProvider } from "../providers/lenses/model-migrations";
import { ThemeFileReferencesLens } from "../providers/lenses/theme-file-references-lens";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerMigrationModelLensProvider(context);
    registerControllerViewLensProvider(context);
    registerMigrationVersionLensProvider(context);

    vscode.languages.registerCodeLensProvider(themeFileSelector, new ThemeFileReferencesLens());
}
