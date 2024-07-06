import { Section } from "../../../../domain/entities/theme/theme-file";
import prettier = require('prettier');

export interface TwigFormattingOptions extends prettier.Options {
    quoteAttributes: boolean
}

/**
 * Format twig section of file
 */
export async function formatTwig(
    code: Section,
    options: TwigFormattingOptions,
    eol: string,
    onlyTwig: boolean,
) {
    options.plugins = [require('prettier-plugin-jinja-template')];
    options.parser = 'jinja-template';

    const twigCode = code.text.trim();

    try {
        let formatted = await prettier.format(twigCode, options);

        let result = (onlyTwig ? '' : '==' + eol) + formatted;

        if (onlyTwig && result.startsWith('==')) {
            result = result.slice(2);
        }

        return result;
    } catch (err) {
        console.error(err);

        let result = (onlyTwig ? '' : '==' + eol) + twigCode;

        if (onlyTwig && result.startsWith('==')) {
            result = result.slice(2);
        }

        return result;
    }
}
