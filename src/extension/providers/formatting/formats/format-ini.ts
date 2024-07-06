import prettier = require('prettier');

export interface IniFormattingOptions extends prettier.Options {
    iniSpaceAroundEquals: boolean;
}

export async function formatIni(
    code: string,
    options: IniFormattingOptions,
    eol: string
): Promise<string> {
    options.plugins = [require('prettier-plugin-ini').default];
    options.parser = 'ini';

    try {
        return await prettier.format(code, options);
    } catch (err) {
        console.error(err);
        return code + eol;
    }
}
