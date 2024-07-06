import prettier = require('prettier');
import { Section } from '../../../helpers/split-markup';

export interface TwigFormattingOptions extends prettier.Options {
    quoteAttributes: boolean
}

/**
 * Format twig section of file
 */
export async function formatTwig(
    twigCode: string,
    options: TwigFormattingOptions,
    eol: string,
    onlyTwig: boolean,
) {
    options.plugins = [require('prettier-plugin-jinja-template')];
    options.parser = 'jinja-template';

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
