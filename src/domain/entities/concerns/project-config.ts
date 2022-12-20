import * as phpParser from 'php-parser';
import { FsHelpers } from "../../helpers/fs-helpers";
import { PhpHelpers } from "../../helpers/php-helpers";
import { Project } from "../project";
import path = require("path");

/**
 * Get config keys from project
 *
 * @param project
 * @returns
 */
export function getConfig(project: Project) {
    return [
        ...indexConfigDir(path.join(project.path, 'config')),
        ...project.plugins.map(plugin => indexConfigDir(
            path.join(plugin.path, 'config'),
            plugin.name + '::'
        ))
    ].flat().sort();
}

/**
 * Get config keys from directory
 *
 * @param configDir
 * @param prefix
 * @returns
 */
function indexConfigDir(configDir: string, prefix: string = ''): string[] {
    const entries: string[] = [];

    if (!FsHelpers.exists(configDir)) {
        return entries;
    }

    FsHelpers.listFiles(configDir, false, ['.php']).forEach(fileName => {
        const filePath = path.join(configDir, fileName);
        const content = FsHelpers.readFile(filePath);
        const ast = PhpHelpers.getAst(content, fileName);

        const returnExpr = ast.children.find(el => el.kind === 'return') as phpParser.Return;
        if (returnExpr.expr?.kind !== 'array') {
            return;
        }

        const configPrefix = fileName === 'config.php'
            ? prefix
            : prefix + fileName.slice(0, fileName.length - 4) + '.';

        const phpArray = returnExpr.expr as phpParser.Array;

        entries.push(...getArrayKeysAsDottedList(phpArray, configPrefix));
    });

    return entries;
}

/**
 * Get array keys as dotted strings
 *
 * Example: database.connections.mysql.database
 *
 * @param phpArray
 * @param prefix
 * @returns
 */
function getArrayKeysAsDottedList(phpArray: phpParser.Array, prefix: string = '') {
    const dottedList: string[] = [];

    phpArray.items.forEach(_item => {
        const item = _item as phpParser.Entry;
        if (item.key?.kind !== 'string') {
            return;
        }

        const itemKey = (item.key as phpParser.String).value;

        if (item.value.kind === 'array') {
            dottedList.push(...getArrayKeysAsDottedList(
                item.value as phpParser.Array,
                prefix + itemKey + '.'
            ));
        } else {
            dottedList.push(prefix + itemKey);
        }
    });

    return dottedList;
}
