import prettier = require('prettier');

export interface IniFormattingOptions extends prettier.Options {
    iniSpaceAroundEquals: boolean;
}

export async function formatIni(
    iniCode: string,
    options: IniFormattingOptions,
    eol: string
): Promise<string> {
    options.plugins = [require('prettier-plugin-ini').default];
    options.parser = 'ini';

    try {
        return await prettier.format(iniCode, options);
    } catch (err) {
        console.error(err);
        return iniCode + eol;
    }
}
