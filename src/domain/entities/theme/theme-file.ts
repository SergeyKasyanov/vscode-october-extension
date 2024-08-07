import * as ini from 'ini';
import * as vscode from 'vscode';
import { splitMarkup, ThemeFileSections } from '../../../extension/helpers/split-markup';
import { MethodCalledFromBaseClass } from '../../errors/method-called-from-base-class';
import { Component } from '../classes/component';
import { OctoberEntity } from "../october-entity";
import { Theme } from "../owners/theme";

const PAGE_URL = /->\s*pageUrl\s*\(\s*[\'\"][\w\_\-\/\.]+[\'\"]/g;
const PAGE_STR = /[\'\"][\w\_\-\/\.]+[\'\"]\s*\|\s*page/g;
const PAGE_NAME = /[\'\"][\w\_\-\/\.]+[\'\"]/;

const PARTIAL_TAGS = /\{\%\s*(ajaxPartial|partial)\s+[\'\"][\w\_\-\/\.]+[\'\"]/g;
const PARTIAL_FUNC_CALLS = /partial\s*\([\'\"][\w\_\-\/\.]+[\'\"]/g;
const PARTIAL_NAME = /[\'\"][\w\_\-\/\.]+[\'\"]/;

const CONTENT_TAGS = /\{\%\s*content\s+[\'\"][\w\_\-\/\.]+[\'\"]/g;
const CONTENT_FUNC_CALLS = /content\s*\([\'\"][\w\_\-\/\.]+[\'\"]/g;
const CONTENT_NAME = /[\'\"][\w\_\-\/\.]+[\'\"]/;

const PHP_FUNCTIONS = /function\s+\w+\s*\(/g;
const PHP_VARS = /\$this\[[\'\"]\w+[\'\"]\]\s*=/g;
const PHP_VAR_NAME = /\[[\'\"]\w+[\'\"]\]/;

const TWIG_SET_TAG = /\{\%\s*set\s+\w+\s*=/g;
const TWIG_SET_TAG_START = /\{\%\s*set\s+/;

/**
 * Components attached to file
 */
export type AttachedComponents = {
    [alias: string]: Component;
};

/**
 * Used files in current file with offsets
 * Ex: partials in page
 */
export type UsedFilesList = {
    [name: string]: {
        start: number,
        end: number
    }[]
};

/**
 * Theme file type
 */
export type ThemeFileType = 'layout' | 'page' | 'partial' | 'content';

/**
 * Base class for theme files (layouts, pages, partials, content)
 */
export abstract class ThemeFile extends OctoberEntity {
    /**
     * Theme file owner
     */
    get owner(): Theme {
        return this._owner as Theme;
    }

    /**
     * Entity type
     */
    get type(): ThemeFileType {
        throw new MethodCalledFromBaseClass();
    }

    /**
     * Finds usages of this file
     */
    async findReferences(): Promise<vscode.Location[]> {
        const locations: vscode.Location[] = [];

        const themeFiles = [
            ...this.owner.layouts,
            ...this.owner.pages,
            ...this.owner.partials
        ];

        this.owner.childrenThemes.forEach(child => {
            themeFiles.push(...child.layouts);
            themeFiles.push(...child.pages);
            themeFiles.push(...child.partials);
        });

        let type: 'pages' | 'partials' | 'contents';

        if (this.type === 'page') {
            type = 'pages';
        } else if (this.type === 'partial') {
            type = 'partials';
        } else if (this.type === 'content') {
            type = 'contents';
        } else {
            return [];
        }

        const processedFiles: string[] = [];
        for (const file of themeFiles) {
            if (processedFiles.includes(file.path)) {
                continue;
            }

            const offsets = file[type][this.name] || [];

            for (const offset of offsets) {
                const fileDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(file.path));
                const start = fileDocument.positionAt(offset.start);
                const end = fileDocument.positionAt(offset.end);
                const range = new vscode.Range(start, end);
                const location = new vscode.Location(vscode.Uri.file(file.path), range);

                if (!locations.includes(location)) {
                    locations.push(location);
                }
            }

            processedFiles.push(file.path);
        }

        return locations;
    }
}

/**
 * Base class for theme files with markup (layouts, pages, partials)
 */
export abstract class MarkupFile extends ThemeFile {
    /**
     * File config without components
     */
    get config() {
        if (!this.sections.ini) {
            return {};
        }

        const result: { [key: string]: string } = {};

        const config = ini.parse(this.sections.ini.text);
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const value = config[key];
                if (typeof value === 'string') {
                    result[key] = value;
                }
            }
        }

        return result;
    }

    /**
     * Components attached to this theme file by alias
     */
    get components(): AttachedComponents {
        if (!this.sections.ini) {
            return {};
        }

        const config = ini.parse(this.sections.ini.text);
        const attachedComponents: AttachedComponents = {};

        for (const compName in config) {
            if (Object.prototype.hasOwnProperty.call(config, compName)) {
                if (typeof config[compName] !== 'object') {
                    continue;
                }

                let alias: string,
                    name: string;

                const parts = compName.split(/\s+/);
                if (parts.length === 1) {
                    alias = name = parts[0];
                } else if (parts.length === 2) {
                    alias = parts[1];
                    name = parts[0];
                } else {
                    continue;
                }

                const component = this.owner.project.components.find(
                    c => c.defaultAlias === name || c.fqn === name
                );

                if (component) {
                    attachedComponents[alias] = component;
                }
            }
        }

        return attachedComponents;
    }

    /**
     * Ajax methods declared in php section of this file
     */
    get ajaxMethods(): string[] {
        const phpSection = this.sections.php?.text;
        if (!phpSection) {
            return [];
        }

        const ajaxMethods: string[] = [];
        const skip = ['onInit', 'onStart', 'onBeforePageStart', 'onEnd'];

        for (const match of phpSection.matchAll(PHP_FUNCTIONS)) {
            const func = match[0].replace('function', '').trim().slice(0, -1).trim();

            if (skip.includes(func)) {
                continue;
            }

            if (!ajaxMethods.includes(func) && func.startsWith('on')) {
                ajaxMethods.push(func);
            }
        }

        return ajaxMethods;
    }

    /**
     * Page links in this file
     */
    get pages(): UsedFilesList {
        const pagesNames: UsedFilesList = {};

        const sections = this.sections;

        const pickNameFromMatch = (match: RegExpMatchArray) => {
            const pageNameMatch = match[0].match(PAGE_NAME);
            if (pageNameMatch) {
                const pageName = pageNameMatch[0].slice(1, -1);
                const start = match.index! + pageNameMatch.index! + 1;
                const end = start + pageName.length;

                if (!pagesNames[pageName]) {
                    pagesNames[pageName] = [];
                }

                pagesNames[pageName].push({ start, end });
            }
        };

        if (sections.php) {
            const pageUrlMatches = this.fileContent?.matchAll(PAGE_URL) || [];
            for (const pageUrlMatch of pageUrlMatches) {
                pickNameFromMatch(pageUrlMatch);
            }
        }

        const pageFilteredMatches = this.fileContent?.matchAll(PAGE_STR) || [];
        for (const pageUrlMatch of pageFilteredMatches) {
            pickNameFromMatch(pageUrlMatch);
        }

        return pagesNames;
    }

    /**
     * Partials used in this file
     */
    get partials(): UsedFilesList {
        const partialNames: UsedFilesList = {};

        const pickNameFromMatch = (match: RegExpMatchArray) => {
            const partialNameMatch = match[0].match(PARTIAL_NAME);
            if (partialNameMatch) {
                const partialName = partialNameMatch[0].slice(1, -1);
                const start = match.index! + partialNameMatch.index! + 1;
                const end = start + partialName.length;

                if (!partialNames[partialName]) {
                    partialNames[partialName] = [];
                }

                partialNames[partialName].push({ start, end });
            }
        };

        for (const match of this.fileContent?.matchAll(PARTIAL_TAGS) || []) {
            pickNameFromMatch(match);
        }

        for (const match of this.fileContent?.matchAll(PARTIAL_FUNC_CALLS) || []) {
            pickNameFromMatch(match);
        }

        return partialNames;
    }

    /**
     * Contents used in this file
     */
    get contents(): UsedFilesList {
        const contentNames: UsedFilesList = {};

        const pickNameFromMatch = (match: RegExpMatchArray) => {
            const contentNameMatch = match[0].match(CONTENT_NAME);
            if (contentNameMatch) {
                const contentName = contentNameMatch[0].slice(1, -1);
                const start = match.index! + contentNameMatch.index! + 1;
                const end = start + contentName.length;

                if (!contentNames[contentName]) {
                    contentNames[contentName] = [];
                }

                contentNames[contentName].push({ start, end });
            }
        };

        for (const match of this.fileContent?.matchAll(CONTENT_TAGS) || []) {
            pickNameFromMatch(match);
        }

        for (const match of this.fileContent?.matchAll(CONTENT_FUNC_CALLS) || []) {
            pickNameFromMatch(match);
        }

        return contentNames;
    }

    /**
     * List of vars defined in document
     */
    get definedVars(): string[] {
        const vars: string[] = [];

        const sections = this.sections;
        if (sections.php) {
            const phpVarMatches = sections.php.text.matchAll(PHP_VARS);
            for (const phpVarMatch of phpVarMatches) {
                const varNameMatch = phpVarMatch[0].match(PHP_VAR_NAME);
                if (!varNameMatch) {
                    continue;
                }

                const varName = varNameMatch[0].slice(2, -2);
                if (varName.length === 0) {
                    continue;
                }

                if (!vars.includes(varName)) {
                    vars.push(varName);
                }
            }
        }

        const twigVarMatches = sections.twig.text.matchAll(TWIG_SET_TAG);
        for (const twigVarMatch of twigVarMatches) {
            const varName = twigVarMatch[0].replace(TWIG_SET_TAG_START, '').replace('=', '').trim();
            if (varName.length === 0) {
                continue;
            }

            if (!vars.includes(varName)) {
                vars.push(varName);
            }
        }

        return vars;
    }

    /**
     * Theme file sections (ini, php, twig)
     */
    get sections(): ThemeFileSections {
        if (!this.fileContent) {
            return {
                twig: {
                    text: '',
                    offset: 0
                }
            };
        }

        return splitMarkup(this.fileContent);
    }

    /**
     * Is offset inside ini section of document?
     *
     * @param offset
     * @returns
     */
    isOffsetInsideIni(offset: number): boolean {
        const sections = this.sections;
        if (!sections.ini) {
            return false;
        }

        return offset <= sections.ini.text.length;
    }

    /**
     * Is offset inside base ini section and before first component?
     *
     * @param offset
     * @returns
     */
    isOffsetInsideFileConfig(offset: number): boolean {
        if (!this.isOffsetInsideIni(offset)) {
            return false;
        }

        const firstComponentIndex = this.sections.ini!.text.indexOf('[');
        if (firstComponentIndex > -1) {
            return offset < firstComponentIndex;
        }

        return true;
    }

    /**
     * Is offset inside php section of document?
     *
     * @param offset
     * @returns
     */
    isOffsetInsidePhp(offset: number): boolean {
        const sections = this.sections;
        if (!sections.php) {
            return false;
        }

        const phpStart = sections.php.offset;
        const phpEnd = phpStart + sections.php.text.length;

        return offset >= phpStart && offset <= phpEnd;
    }

    /**
     * Is offset inside twig section of document?
     *
     * @param offset
     * @returns
     */
    isOffsetInsideTwig(offset: number) {
        return offset >= this.sections.twig.offset;
    }
}
