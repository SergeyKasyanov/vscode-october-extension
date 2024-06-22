import * as vscode from 'vscode';
import * as prettierIni from 'prettier-plugin-ini';
import * as prettier from 'prettier/standalone';

export interface IniFormattingOptions extends vscode.FormattingOptions {
    eol: string
}

export async function formatIni(code: string, option: IniFormattingOptions) {
    try {
        return await prettier.format(code, {
            plugins: [prettierIni.default],
            parser: 'ini',
            printWidth: 120,
            // @ts-ignore
            iniSpaceAroundEquals: true
        });
    } catch (err) {
        console.error(err);
        return code + option.eol;
    }
}
