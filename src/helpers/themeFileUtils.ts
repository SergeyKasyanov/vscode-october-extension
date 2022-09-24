import path = require("path");
import { Project } from "../services/project";
import { Component } from "../types/plugin/component";
import { Page } from "../types/theme/page";
import { ThemeMarkupFile } from "../types/theme/themeFile";
import { themesPath } from "./paths";
import { regExps } from "./regExps";
import { splitFrontendFile } from "./splitFrontendFile";

export class ThemeFileUtils {
    public static getComponents(file: ThemeMarkupFile, withLayout: boolean = false): { [alias: string]: Component; } {
        const projectComponents = Project.instance.getComponents();

        let components: { [alias: string]: Component } = {};

        if (withLayout && file instanceof Page && file.layoutName) {
            const layout = file.theme.getLayout(file.layoutName);

            if (layout) {
                components = ThemeFileUtils.getComponents(layout);
            }
        }

        for (const alias in file.components) {
            if (Object.prototype.hasOwnProperty.call(file.components, alias)) {
                const name = file.components[alias];

                if (projectComponents[name]) {
                    components[alias] = projectComponents[name];
                }
            }
        }

        return components;
    }

    public static getComponentsNames(content: string) {
        let names: { [alias: string]: string } = {};

        const sections = splitFrontendFile(content);
        if (sections.length < 2) {
            return names;
        }

        for (const row of sections[0].split('\n')) {
            if (row.trim().startsWith('[')) {
                const splitted = row.trim().slice(1, -1).split(/\s+/);
                const name = splitted[0];
                const alias = splitted.pop();

                if (!name) {
                    continue;
                }

                names[alias!] = name;
            }
        }

        return names;
    }

    public static getIniProperties(content: string) {
        let iniProperties: { [key: string]: string } = {};

        const sections = splitFrontendFile(content);
        if (sections.length < 2) {
            return iniProperties;
        }

        for (const row of sections[0].split('\n')) {
            const trimmed = row.trim();

            if (trimmed.startsWith('==') || trimmed.startsWith('[')) {
                break;
            }

            const match = trimmed.match(regExps.iniProperty);
            if (!match) {
                continue;
            }

            let key, value;
            [key, value] = match[0].split(regExps.iniPropertyDivider);

            const valueIsQuoted = value.match(/[\'\"]\w+[\'\"]/);
            if (valueIsQuoted) {
                value = value.slice(1, -1);
            }

            iniProperties[key] = value;
        }

        return iniProperties;
    }

    public static getDefinedVars(content: string): string[] {
        const sections = splitFrontendFile(content);

        let vars: string[] = [],
            phpSection: string | undefined,
            twigSection: string | undefined;

        if (sections.length === 3) {
            phpSection = sections[1];
            twigSection = sections[2];
        } else if (sections.length === 2) {
            twigSection = sections[1];
        } else {
            return vars;
        }

        if (phpSection) {
            const phpVarMatches = phpSection.matchAll(regExps.varDefinitionGlobal);
            for (const phpVarMatch of phpVarMatches) {
                const varNameMatch = phpVarMatch[0].match(regExps.varNameInsideThis);
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

        const twigVarMatches = twigSection!.matchAll(regExps.setVarStatementGlobal);
        for (const twigVarMatch of twigVarMatches) {
            const varName = twigVarMatch[0].replace(regExps.setVarStatementStart, '').replace('=', '').trim();
            if (varName.length === 0) {
                continue;
            }

            if (!vars.includes(varName)) {
                vars.push(varName);
            }
        }

        return vars;
    }

    public static getEchoedVars(content: string): string[] {
        let vars: string[] = [];

        const varsMatches = content.matchAll(regExps.partialVarGlobal);

        for (const variable of varsMatches) {
            const varName = variable[0].replace(/\{\{\s*/, '').trim();

            if (!vars.includes(varName)) {
                vars.push(varName);
            }
        }

        return vars;
    }

    public static getContentVars(content: string): string[] {
        let vars: string[] = [];

        const varsMatches = content.matchAll(regExps.contentVarGlobal);

        for (const variable of varsMatches) {
            const varName = variable[0].slice(1, -1);

            if (!vars.includes(varName)) {
                vars.push(varName);
            }
        }

        return vars;
    }

    public static getPlaceholders(content: string): string[] {
        let placeholders: string[] = [];

        const sections = splitFrontendFile(content);
        const twigSection = sections.pop();

        if (!twigSection) {
            return placeholders;
        }

        const placeholderTagsMatches = twigSection.matchAll(regExps.placeholderTagGlobal);
        for (const match of placeholderTagsMatches) {
            const placeholder = match[0].replace(regExps.placeholderTagStart, '').trim();
            placeholders.push(placeholder);
        }

        const placeholderVarsMatches = twigSection.matchAll(regExps.placeholderVarGlobal);
        for (const match of placeholderVarsMatches) {
            const placeholder = match[0].replace(regExps.placeholderVarStart, '').trim().slice(0, -1);
            placeholders.push(placeholder);
        }

        return placeholders;
    }

    public static getUsedPartials(content: string): string[] {
        let partials: string[] = [];

        const sections = splitFrontendFile(content);
        const twigSection = sections.pop();

        if (!twigSection) {
            return partials;
        }

        const partialTagsMatches = twigSection.matchAll(regExps.partialTagGlobal);
        for (const match of partialTagsMatches) {
            const partialName = match[0].replace(regExps.partialTagStart, '').slice(0, -1);
            partials.push(partialName);
        }

        return partials;
    }

    public static getUsedContents(content: string): string[] {
        let contents: string[] = [];

        const sections = splitFrontendFile(content);
        const twigSection = sections.pop();

        if (!twigSection) {
            return contents;
        }

        const contentTagsMatches = twigSection.matchAll(regExps.contentTagGlobal);
        for (const match of contentTagsMatches) {
            const contentName = match[0].replace(regExps.contentTagsStart, '').slice(0, -1);
            contents.push(contentName);
        }

        return contents;
    }

    public static getAjaxMethods(content: string): string[] {
        const sections = splitFrontendFile(content);
        if (sections.length !== 3) {
            return [];
        }

        const phpSection = sections[1];
        const functionDeclarations = phpSection.matchAll(regExps.phpFunctionDeclarationStartGlobal);

        let ajaxMethods: string[] = [];
        const forbidden = ['onInit', 'onStart', 'onBeforePageStart', 'onEnd'];

        for (const match of functionDeclarations) {
            const func = match[0].replace('function', '').trim().slice(0, -1).trim();

            if (forbidden.includes(func)) {
                continue;
            }

            if (!ajaxMethods.includes(func) && func.startsWith('on')) {
                ajaxMethods.push(func);
            }
        }

        return ajaxMethods;
    }

    public static parseFileName(filename: string) {
        if (filename.startsWith(themesPath())) {
            filename = filename.replace(themesPath(), '');
        }

        let parts = filename.split(path.sep);
        if (parts[0] === '') {
            parts.shift();
        }

        let theme: string,
            type: string,
            file: string,
            ext: string;

        theme = parts.shift() || '';
        type = parts.shift() || '';
        [file, ext] = parts.join('/').split('.');

        return { theme, type, file, ext };
    }
}
