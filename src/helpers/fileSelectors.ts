import { DocumentFilter } from "vscode";

export const octoberTplSelector: DocumentFilter = {
    scheme: 'file',
    language: 'october-tpl'
};

export const txtSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/*.txt'
};

export const mdSelector: DocumentFilter = {
    scheme: 'file',
    pattern: '**/*.md'
};

export const phpSelector: DocumentFilter = {
    scheme: 'file',
    language: 'php'
};

export const yamlSelector: DocumentFilter = {
    scheme: 'file',
    language: 'yaml'
};
