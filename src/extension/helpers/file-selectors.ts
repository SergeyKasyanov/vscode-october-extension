import { DocumentFilter } from "vscode";

/**
 * Selector for october cms template files
 */
export const octoberTplSelector: DocumentFilter = {
    scheme: 'file',
    language: 'october-tpl'
};

/**
 * Selector for text files
 */
export const txtSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/*.txt'
};

/**
 * Selector for markdown files
 */
export const mdSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/*.md'
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
