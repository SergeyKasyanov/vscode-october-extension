import * as vscode from "vscode";

export function isBackendControllerStructured(): boolean {
    return getExtensionConfig().get<boolean>('structuredControllers') || false;
}

export function adjacentModelTraits(): boolean {
    return getExtensionConfig().get<boolean>('adjacentModelTraits') || false;
}

export function pluginsDirectory(): string {
    return getExtensionConfig().get<string>('pluginsPath') || 'plugins';
}

export function themesDirectory(): string {
    return getExtensionConfig().get<string>('themesPath') || 'themes';
}

export function enableThemeFilesFolding(): boolean {
    return getExtensionConfig().get<boolean>('enableThemeFilesFolding') || false;
}

export function hideTailorPermissions(): boolean {
    return getExtensionConfig().get<boolean>('hideTailorPermissions') === true;
}

export function getPhpPath(): string {
    return getExtensionConfig().get<string>('phpExecutable') || 'php';
}

export function useSpacer() {
    return getExtensionConfig().get<boolean>('useSpacer') || false;
}

function getExtensionConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('octoberCode');
}

export class Config {
    static get getPhpPath(): string {
        return Config.extensionConfig.get<string>('phpExecutable') || 'php';
    }

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

    private static get extensionConfig(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('octoberCode');
    }
}
