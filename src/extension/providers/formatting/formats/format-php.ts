import prettier = require('prettier');

export interface PhpFormattingOptions extends prettier.Options {
    phpVersion: '5.0' | '5.1' | '5.2' | '5.3' | '5.4' | '5.5' | '5.6' | '7.0' | '7.1' | '7.2' | '7.3' | '7.4' | '8.0' | '8.1' | '8.2';
    trailingCommaPHP: boolean;
    braceStyle: 'psr-2' | 'per-cs' | '1tbs';
    singleQuote: boolean;
}

/**
 * Formats php section of file
 */
export async function formatPhp(
    phpCode: string,
    options: PhpFormattingOptions,
    eol: string
) {
    options.plugins = [require('@prettier/plugin-php/standalone')];
    options.parser = 'php';

    phpCode = cleanPhpCode(phpCode, eol);

    try {
        const formatted = await prettier.format(phpCode, options);

        return '==' + eol + formatted;
    } catch (err) {
        console.error(err);
        return '==' + eol + phpCode + eol;
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
