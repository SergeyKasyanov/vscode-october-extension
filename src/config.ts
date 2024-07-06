import * as vscode from "vscode";

export class Config {
    static get pluginsDirectory(): string {
        return Config.extensionConfig.get<string>('pluginsPath') || 'plugins';
    }

    static get themesDirectory(): string {
        return Config.extensionConfig.get<string>('themesPath') || 'themes';
    }

    static get isTailorPermissionsHidden(): boolean {
        return Config.extensionConfig.get<boolean>('hideTailorPermissions') === true;
    }

    static get isBackendControllerStructured(): boolean {
        return Config.extensionConfig.get<boolean>('structuredControllers') || false;
    }

    static get isModelsTraitAdjacent(): boolean {
        return Config.extensionConfig.get<boolean>('adjacentModelTraits') || false;
    }

    static get isSpacerEnabled(): boolean {
        return Config.extensionConfig.get<boolean>('useSpacer') || false;
    }

    static get excludeFromIndex(): string[] {
        return this.extensionConfig.get<string[]>('excludeFromIndex') || [];
    }

    static get showModulesEntitiesInGoToCommands(): boolean {
        return this.extensionConfig.get<boolean>('showModulesEntitiesInGoToCommands') || false;
    }

    static get prettierrcPath(): string {
        return this.extensionConfig.get<string>('prettierrcPath') || '.prettierrc';
    }

    private static get extensionConfig(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('octoberCode');
    }
}
