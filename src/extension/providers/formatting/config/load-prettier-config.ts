import * as vscode from "vscode";
import { Config } from "../../../../config";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../../domain/helpers/path-helpers";
import prettier = require('prettier');

/**
 * Get prettier config based on .prettierrc config file and default values
 */
export async function loadPrettierConfig(
    projectRoot: string,
    options: vscode.FormattingOptions
): Promise<prettier.Options> {
    let config: prettier.Options = {};

    const configPath = PathHelpers.rootPath(projectRoot, Config.prettierrcPath);

    if (FsHelpers.exists(configPath)) {
        try {
            config = await prettier.resolveConfig(configPath) || {};
        } catch (err) {
            console.error(err);
        }
    }

    //
    // common
    //

    if (!('printWidth' in config)) {
        config.printWidth = 120;
    }

    if (!('tabWidth' in config)) {
        config.tabWidth = options.tabSize;
    }

    if (!('useTabs' in config)) {
        config.useTabs = !options.insertSpaces;
    }

    //
    // ini
    //

    if (!('iniSpaceAroundEquals' in config)) {
        config.iniSpaceAroundEquals = true;
    }

    //
    // php
    //

    if (!('phpVersion' in config)) {
        config.phpVersion = '7.2';
    }

    if (!('trailingCommaPHP' in config)) {
        config.trailingCommaPHP = true;
    }

    if (!('braceStyle' in config)) {
        config.braceStyle = 'per-cs';
    }

    if (!('singleQuote' in config)) {
        config.singleQuote = true;
    }

    //
    // twig
    //

    config.quoteAttributes = true; // always true because OctoberCMS data attributes should be quoted

    return config;
}
