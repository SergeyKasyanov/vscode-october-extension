import { DocumentFilter } from "vscode";
import { Config } from "../../config";

/**
 * Selector for october cms template files
 */
export const octoberTplSelector: DocumentFilter = {
    scheme: 'file',
    language: 'october-tpl'
};

/**
 * Selector for all theme files (markup and content)
 */
export const themeFileSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/' + Config.themesDirectory + '/**/*.{htm,txt,md}'
};

/**
 * Selector for php files
 */
export const phpSelector: DocumentFilter = {
    scheme: 'file',
    language: 'php'
};

/**
 * Selector for yaml files
 */
export const yamlSelector: DocumentFilter = {
    scheme: 'file',
    language: 'yaml'
};

/**
 * Selector for env files
 */
export const envSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/.env*'
};
