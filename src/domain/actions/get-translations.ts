import * as phpParser from 'php-parser';
import { FsHelpers } from "../helpers/fs-helpers";
import { PathHelpers } from "../helpers/path-helpers";
import { PhpHelpers } from "../helpers/php-helpers";
import { Project } from "../entities/project";
import path = require("path");

export type Translations = { [key: string]: string };

type LangFiles = {
    file: string;
    type: 'json' | 'php';
    prefix?: string;
}[];

/**
 * Get translations from project
 *
 * @param project
 * @returns
 */
export function getTranslations(project: Project): Translations {
    let translations: Translations = {};

    const langFiles: LangFiles = getLangFiles(project);

    langFiles.forEach(langFile => {
        let fileTranslations: Translations = {};

        if (langFile.type === 'json') {
            const content = FsHelpers.readFile(langFile.file);
            fileTranslations = JSON.parse(content);
        } else if (langFile.type === 'php') {
            fileTranslations = getPhpFileTranslations(langFile.file, langFile.prefix!);
        }

        translations = Object.assign(translations, fileTranslations);
    });

    return translations;
}

/**
 * Get files for index translations
 *
 * @param locale
 * @param langDirectory
 */
function getLangFiles(project: Project) {
    const locale = project.locale;

    const langFiles: LangFiles = [];

    project.modules.forEach(module => langFiles.push(...getLangFilesFromDirectory(
        locale,
        path.join(module.path, 'lang'),
        module.name + '::'
    )));

    project.plugins.forEach(plugin => langFiles.push(...getLangFilesFromDirectory(
        locale,
        path.join(plugin.path, 'lang'),
        plugin.name + '::'
    )));

    if (project.platform!.hasAppDirectory && project.appDir) {
        langFiles.push(...getLangFilesFromDirectory(
            locale,
            path.join(project.appDir.path, 'lang'),
            'app::'
        ));
    }

    const rootLangDir = PathHelpers.rootPath(project.path, 'lang');
    langFiles.push(...getLangFilesFromDirectory(locale, rootLangDir));

    return langFiles;
}

/**
 * Get files from directory for index translations
 *
 * @param locale
 * @param langDirectory
 */
function getLangFilesFromDirectory(locale: string, langDirectory: string, prefix: string = ''): LangFiles {
    const langFiles: LangFiles = [];

    const jsonFile = path.join(langDirectory, `${locale}.json`);
    if (FsHelpers.exists(jsonFile)) {
        langFiles.push({
            file: jsonFile,
            type: 'json'
        });
    }

    const phpFilesPath = path.join(langDirectory, `${locale}`);
    if (FsHelpers.exists(phpFilesPath)) {
        FsHelpers.listFiles(phpFilesPath, true, ['php']).forEach(file => {
            langFiles.push({
                file: path.join(phpFilesPath, file),
                type: 'php',
                prefix: prefix + file.split(path.sep).join('.').slice(0, -4)
            });
        });
    }

    return langFiles;
}

/**
 * Get translations from php file
 *
 * @param filePath
 * @param prefix
 * @returns
 */
function getPhpFileTranslations(filePath: string, prefix: string): Translations {
    const content = FsHelpers.readFile(filePath);
    const ast = PhpHelpers.getAst(content, 'lang.php');

    const returnExpr = ast?.children.find(el => el.kind === 'return') as phpParser.Return;
    if (returnExpr.expr?.kind !== 'array') {
        return {};
    }

    return getTranslationsFromArray(returnExpr.expr as phpParser.Array, prefix);
}

/**
 * Get translations from php array
 *
 * @param langArray
 * @returns
 */
function getTranslationsFromArray(langArray: phpParser.Array, prefix: string) {
    let translations: Translations = {};

    for (const entry of langArray.items) {
        const key = (entry as phpParser.Entry).key;
        const value = (entry as phpParser.Entry).value;

        if (key?.kind !== 'string') {
            continue;
        }

        const transKey = prefix + '.' + (key as phpParser.String).value;

        if (value.kind === 'string') {
            translations[transKey] = (value as phpParser.String).value;
        } else if (value.kind === 'array') {
            translations = Object.assign(translations, getTranslationsFromArray(
                value as phpParser.Array,
                transKey
            ));
        }
    }

    return translations;
}
