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

function getExtensionConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('octoberCode');
}
