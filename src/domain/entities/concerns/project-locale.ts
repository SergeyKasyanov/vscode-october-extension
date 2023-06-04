import * as phpParser from 'php-parser';
import { FsHelpers } from "../../helpers/fs-helpers";
import { PathHelpers } from "../../helpers/path-helpers";
import { PhpHelpers } from "../../helpers/php-helpers";
import { Project } from "../project";
import path = require("path");

/**
 * Detect project locale
 *
 * @param project
 * @returns
 */
export function getLocale(project: Project): string {
    return localeFromEnv(project)
        || localeFromConfig(project)
        || 'en';
}

/**
 * Try to load app locale from .env
 *
 * @param project
 * @returns
 */
function localeFromEnv(project: Project) {
    return project.envVariables.find(ev => ev.key === 'APP_LOCALE')?.value;
}

/**
 * Try to load app locale from config/app.php
 *
 * @param project
 * @returns
 */
function localeFromConfig(project: Project): string | null | undefined {
    const configPath = PathHelpers.rootPath(project.path, path.join('config', 'app.php'));
    const configContent = FsHelpers.readFile(configPath);
    const ast = PhpHelpers.getAst(configContent, configPath);

    const returnExpr = ast.children.find(el => el.kind === 'return') as phpParser.Return;
    if (returnExpr.expr?.kind !== 'array') {
        return;
    }

    const localeEntry = (returnExpr.expr as phpParser.Array).items.find(item => {
        const key = (item as phpParser.Entry).key;
        if (key?.kind === 'string' && (key as phpParser.String).value === 'locale') {
            return true;
        }
    }) as phpParser.Entry;

    if (!localeEntry || localeEntry.value.kind !== 'string') {
        return;
    }

    return (localeEntry.value as phpParser.String).value;
}
