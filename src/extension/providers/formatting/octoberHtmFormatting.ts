import * as prettierPhp from "@prettier/plugin-php/standalone";
import * as prettierDjango from 'prettier-plugin-django';
import * as prettierIni from 'prettier-plugin-ini';
import * as prettier from 'prettier/standalone';
import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { splitFrontendFile } from "../../../helpers/splitFrontendFile";

export class OctoberHtmDocumentFormatting implements vscode.DocumentFormattingEditProvider {

    private document: vscode.TextDocument | undefined;
    private options: vscode.FormattingOptions | undefined;
    private eol: string | undefined;

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {

        this.document = document;
        this.options = options;
        this.eol = (document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');

        let result: string = '';

        const sections = this.getSections();
        if (!sections) {
            return;
        }

        let onlyTwig = true;

        if (sections.ini?.length) {
            result += this.formatIni(sections.ini.trim());
            onlyTwig = false;
        }

        if (sections.php?.length) {
            result += this.formatPhp(sections.php.trim());
            onlyTwig = false;
        }

        if (sections.twig) {
            result += this.formatTwig(sections.twig.trim(), onlyTwig);
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

    private getSections() {
        const sections = splitFrontendFile(this.document!.getText());

        let ini, php, twig;
        if (sections.length === 0) {
            return;
        } else if (sections.length === 1) {
            twig = sections.shift();
        } else if (sections.length === 2) {
            ini = sections.shift();
            twig = sections.shift();
        } else if (sections.length === 3) {
            ini = sections.shift();
            php = sections.shift();
            twig = sections.shift();
        } else {
            ini = sections.shift();
            php = sections.shift();
            twig = sections.join(this.eol + '==' + this.eol);
        }

        return { ini, php, twig };
    }

    private formatIni(iniCode: string) {
        try {
            return prettier.format(iniCode, {
                plugins: [prettierIni],
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

    private formatPhp(phpCode: string) {
        phpCode = this.cleanPhpCode(phpCode);

        try {
            const phpFormatted = prettier.format(phpCode, {
                plugins: [prettierPhp],
                parser: 'php',
                printWidth: 120,
                tabWidth: this.options!.tabSize,
                useTabs: !this.options!.insertSpaces
            });

            return '==' + this.eol + phpFormatted;
        } catch (err) {
            console.error(err);
            return '==' + this.eol + phpCode + this.eol;
        }
    }

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

        if (result[0] !== '<?php') {
            result.unshift('<?php');
        }

        if (result[result.length - 1] !== '?>') {
            result.push('?>');
        }

        return result.join(this.eol);
    }

    private formatTwig(twigCode: string, onlyTwig: boolean) {
        try {
            let twigFormatted = prettier.format(twigCode, {
                plugins: [prettierDjango],
                parser: 'melody',
                // @ts-ignore
                twigPrintWidth: 5000,
                printWidth: 5000,
                tabWidth: this.options!.tabSize,
                useTabs: !this.options!.insertSpaces
            });

            twigFormatted = this.formatStyles(twigFormatted);
            twigFormatted = this.formatScripts(twigFormatted);

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

    private formatStyles(twigCode: string) {
        const styleMatches = twigCode.matchAll(regExps.styleTagWithContentGlobal);

        for (const match of styleMatches) {
            try {
                const size = match[0].length;
                const css = match[0].slice('<style>'.length, -1 * '</style>'.length);

                const formatted = prettier.format(css, {
                    plugins: [require('prettier/parser-postcss')],
                    parser: 'css',
                    tabWidth: this.options!.tabSize,
                    useTabs: !this.options!.insertSpaces
                });

                const begin = twigCode.slice(0, match.index!);
                const end = twigCode.slice(match.index! + size);

                twigCode = begin + '<style>' + this.eol + formatted + '</style>' + end;
            } catch (err) {
                console.error(err);
            }
        }

        return twigCode;
    }

    private formatScripts(twigCode: string) {
        const scriptMatches = twigCode.matchAll(regExps.scriptTagWithContentGlobal);

        for (const match of scriptMatches) {
            try {
                const size = match[0].length;
                const script = match[0].slice('<script>'.length, -1 * '</script>'.length);

                const formatted = prettier.format(script, {
                    plugins: [require('prettier/parser-babel')],
                    parser: 'babel',
                    tabWidth: this.options!.tabSize,
                    useTabs: !this.options!.insertSpaces
                });

                const begin = twigCode.slice(0, match.index!);
                const end = twigCode.slice(match.index! + size);

                twigCode = begin + '<script>' + this.eol + formatted + '</script>' + end;
            } catch (err) {
                console.error(err);
            }
        }

        return twigCode;
    }
}
