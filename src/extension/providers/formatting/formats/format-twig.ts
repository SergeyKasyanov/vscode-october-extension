import * as prettier from "prettier";
import * as jinjaPlugin from 'prettier-plugin-jinja-template';

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
    options.plugins = [jinjaPlugin];
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
