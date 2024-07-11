import * as vscode from "vscode";
import { phpSelector, themeFileSelector, yamlSelector } from "../helpers/file-selectors";
import { ComponentUsages } from "../providers/lenses/component-usages";
import { registerControllerViewLensProvider } from "../providers/lenses/controller-view";
import { registerMigrationAddToVersionLensProvider } from "../providers/lenses/migration-add-to-version";
import { registerMigrationModelLensProvider } from "../providers/lenses/migration-models";
import { registerMigrationVersionLensProvider } from "../providers/lenses/migration-version";
import { registerModelMigrationsLensProvider } from "../providers/lenses/model-migrations";
import { ThemeFileReferencesLens } from "../providers/lenses/theme-file-references-lens";
import { YamlReferenceLens } from "../providers/lenses/yaml-reference-lens";

export function registerCodeLenses(context: vscode.ExtensionContext) {
    registerModelMigrationsLensProvider(context);
    registerMigrationModelLensProvider(context);
    registerControllerViewLensProvider(context);
    registerMigrationVersionLensProvider(context);
    registerMigrationAddToVersionLensProvider(context);

    vscode.languages.registerCodeLensProvider(themeFileSelector, new ThemeFileReferencesLens());
    vscode.languages.registerCodeLensProvider(yamlSelector, new YamlReferenceLens());
    vscode.languages.registerCodeLensProvider(phpSelector, new ComponentUsages());
}
