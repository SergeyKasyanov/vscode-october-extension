import * as vscode from "vscode";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { splitMarkup } from "../../helpers/split-markup";
import { formatIni, IniFormattingOptions } from "./formats/format-ini";
import { formatPhp, PhpFormattingOptions } from "./formats/format-php";
import { formatTwig, TwigFormattingOptions } from "./formats/format-twig";
import prettier = require('prettier');

/**
 * Provides document formatting support for OctoberCMS theme templates
 */
export class OctoberTplDocumentFormatting implements vscode.DocumentFormattingEditProvider {

    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return [];
        }

        const config = await this.loadPrettierConfig(project!.path, options);
        const eol = (document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        const sections = splitMarkup(document.getText());
        let onlyTwig = true;

        let result: string = '';

        if (sections.ini?.text.length) {
            result += await formatIni(sections.ini.text.trim(), config as IniFormattingOptions, eol);
            onlyTwig = false;
        }

        if (sections.php?.text.length) {
            result += await formatPhp(sections.php.text.trim(), config as PhpFormattingOptions, eol);
            onlyTwig = false;
        }

        if (sections.twig) {
            result += await formatTwig(sections.twig, config as TwigFormattingOptions, eol, onlyTwig);
        }

        return new Promise(resolve => {
            resolve([
                new vscode.TextEdit(
                    new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).text.length)
                    ),
                    result
                )
            ]);
        });
    }

    private async loadPrettierConfig(projectRoot: string, options: vscode.FormattingOptions) {
        let config: prettier.Options = {};

        const configPath = PathHelpers.rootPath(projectRoot, '.prettierrc');

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
}
