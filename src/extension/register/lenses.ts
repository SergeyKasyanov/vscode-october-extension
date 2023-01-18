import * as vscode from "vscode";
import { octoberTplSelector } from "../helpers/file-selectors";
import { registerControllerViewLensProvider } from "../providers/lenses/controller-view";
import { ThemeFileReferencesLens } from "../providers/lenses/theme-file-references-lens";
import { registerMigrationModelLensProvider } from "../providers/lenses/migration-models";
import { registerModelMigrationsLensProvider } from "../providers/lenses/model-migrations";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerMigrationModelLensProvider(context);
    registerControllerViewLensProvider(context);

    vscode.languages.registerCodeLensProvider(octoberTplSelector, new ThemeFileReferencesLens());
}
