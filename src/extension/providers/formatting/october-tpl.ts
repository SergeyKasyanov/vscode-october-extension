import * as prettierPhp from "@prettier/plugin-php";
import * as prettierDjango from 'prettier-plugin-django';
import * as prettierIni from 'prettier-plugin-ini';
import * as prettier from 'prettier/standalone';
import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const STYLE_TAG = /\<style\>(.|\r?\n)*\<\/style\>/g;
const SCRIPT_TAG = /\<script\>(.|\r?\n)*\<\/script\>/g;

/**
 * Provides document formatting support for OctoberCMS theme templates
 */
export class OctoberTplDocumentFormatting implements vscode.DocumentFormattingEditProvider {

    private document?: vscode.TextDocument;
    private options?: vscode.FormattingOptions;
    private eol?: string;

    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {

        this.document = document;
        this.options = options;
        this.eol = (document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');

        let result: string = '';

        const entity = Store.instance.findEntity(document.fileName) as MarkupFile;
        const sections = entity.sections;

        let onlyTwig = true;

        if (sections.ini?.text.length) {
            result += await this.formatIni(sections.ini.text.trim());
            onlyTwig = false;
        }

        if (sections.php?.text.length) {
            result += await this.formatPhp(sections.php.text.trim());
            onlyTwig = false;
        }

        if (sections.twig) {
            result += await this.formatTwig(sections.twig.text.trim(), sections.twig.offset, onlyTwig);
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

    /**
     * Formats ini section of file
     */
    private async formatIni(iniCode: string) {
        try {
            return await prettier.format(iniCode, {
                plugins: [prettierIni.default],
                parser: 'ini',
                printWidth: 120,
                // @ts-ignore
                iniSpaceAroundEquals: true
            });
        } catch (err) {
            console.error(err);
            return iniCode + this.eol;
        }
    }

    /**
     * Formats php section of file
     */
    private async formatPhp(phpCode: string) {
        phpCode = this.cleanPhpCode(phpCode);

        try {
            const phpFormatted = await prettier.format(phpCode, {
                plugins: [prettierPhp],
                parser: 'php',
                printWidth: 120,
                tabWidth: this.options!.tabSize,
                useTabs: !this.options!.insertSpaces,
                singleQuote: true,
                // @ts-ignore
                phpVersion: '7.2',
            });

            return '==' + this.eol + phpFormatted;
        } catch (err) {
            console.error(err);
            return '==' + this.eol + phpCode + this.eol;
        }
    }

    /**
     * Clean up php code.
     * Removes public, protected and private keywords.
     * Makes sure php code has <?php and ?>
     */
    private cleanPhpCode(phpCode: string) {
        const lines = phpCode.split(/\r?\n/);
        let result = [];

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('public')) {
                line = line.slice(6);
            } else if (line.startsWith('protected')) {
                line = line.slice(9);
            } else if (line.startsWith('private')) {
                line = line.slice(7);
            } else if (line.length === 0) {
                continue;
            }

            result.push(line);
        }

        if (result[0] === '<?') {
            result[0] = '<?php';
        }

        if (result[0] !== '<?php') {
            result.unshift('<?php');
        }

        if (result[result.length - 1] !== '?>') {
            result.push('?>');
        }

        return result.join(this.eol);
    }

    /**
     * Format twig section of file
     */
    private async formatTwig(twigCode: string, twigOffset: number, onlyTwig: boolean) {
        try {
            let twigFormatted = await prettier.format(twigCode, {
                plugins: [prettierDjango],
                parser: 'melody',
                printWidth: 5000,
                tabWidth: this.options!.tabSize,
                useTabs: !this.options!.insertSpaces,
                embeddedLanguageFormatting: 'auto',
                // @ts-ignore
                twigPrintWidth: 5000,
            });

            twigFormatted = await this.formatStyles(twigFormatted, twigOffset);
            twigFormatted = await this.formatScripts(twigFormatted, twigOffset);

            let result = (onlyTwig ? '' : '==' + this.eol) + twigFormatted;

            if (onlyTwig && result.startsWith('==')) {
                result = result.slice(2);
            }

            return result;
        } catch (err) {
            console.error(err);

            let result = (onlyTwig ? '' : '==' + this.eol) + twigCode;

            if (onlyTwig && result.startsWith('==')) {
                result = result.slice(2);
            }

            return result;
        }
    }

    /**
     * Format css code inside style tags
     */
    private async formatStyles(twigCode: string, twigOffset: number) {
        const styleMatches = twigCode.matchAll(STYLE_TAG);

        for (const match of styleMatches) {
            try {
                const line = this.document!.positionAt(twigOffset + match.index).line;
                const lineText = this.document!.lineAt(line).text;
                const indentMatch = lineText.match(/^\s*/);
                const indent = indentMatch ? indentMatch[0] : '';

                const size = match[0].length;
                const css = match[0].slice('<style>'.length, -1 * '</style>'.length);

                let formatted = await prettier.format(css, {
                    plugins: [require('prettier/parser-postcss')],
                    parser: 'css',
                    tabWidth: this.options!.tabSize,
                    useTabs: !this.options!.insertSpaces
                });

                formatted = formatted
                    .split(/\r?\n/)
                    .map(line => line.length > 0 ? indent + line : line)
                    .join(this.eol);

                const begin = twigCode.slice(0, match.index!);
                const end = twigCode.slice(match.index! + size);

                twigCode = begin + '<style>' + this.eol + formatted + indent + '</style>' + end;
            } catch (err) {
                console.error(err);
            }
        }

        return twigCode;
    }

    /**
     * Format javascript code inside script tags
     */
    private async formatScripts(twigCode: string, twigOffset: number) {
        const scriptMatches = twigCode.matchAll(SCRIPT_TAG);

        for (const match of scriptMatches) {
            try {
                const line = this.document!.positionAt(twigOffset + match.index).line;
                const lineText = this.document!.lineAt(line).text;
                const indentMatch = lineText.match(/^\s*/);
                const indent = indentMatch ? indentMatch[0] : '';

                const size = match[0].length;
                const script = match[0].slice('<script>'.length, -1 * '</script>'.length);

                let formatted = await prettier.format(script, {
                    plugins: [require('prettier/parser-babel')],
                    parser: 'babel',
                    tabWidth: this.options!.tabSize,
                    useTabs: !this.options!.insertSpaces
                });

                formatted = formatted
                    .split(/\r?\n/)
                    .map(line => line.length > 0 ? indent + line : line)
                    .join(this.eol);

                const begin = twigCode.slice(0, match.index!);
                const end = twigCode.slice(match.index! + size);

                twigCode = begin + '<script>' + this.eol + formatted + indent + '</script>' + end;
            } catch (err) {
                console.error(err);
            }
        }

        return twigCode;
    }
}
