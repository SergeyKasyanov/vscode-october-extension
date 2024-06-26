import * as vscode from 'vscode';
import * as prettierPhp from "@prettier/plugin-php";
import * as prettier from 'prettier/standalone';

export interface PhpFormattingOptions extends vscode.FormattingOptions {
    eol: string,
}

/**
 * Formats php section of file
 */
export async function formatPhp(phpCode: string, options: PhpFormattingOptions) {
    phpCode = cleanPhpCode(phpCode, options.eol);

    try {
        const phpFormatted = await prettier.format(phpCode, {
            plugins: [prettierPhp],
            parser: 'php',
            printWidth: 120,
            tabWidth: options!.tabSize,
            useTabs: !options!.insertSpaces,
            singleQuote: true,
            // @ts-ignore
            phpVersion: '7.2',
        });

        return '==' + options.eol + phpFormatted;
    } catch (err) {
        console.error(err);
        return '==' + options.eol + phpCode + options.eol;
    }
}

/**
 * Clean up php code.
 * Removes public, protected and private keywords.
 * Makes sure php code has <?php and ?>
 */
function cleanPhpCode(phpCode: string, eol: string) {
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

    return result.join(eol);
}
