import * as vscode from 'vscode';
import prettier = require('prettier');

export interface IniFormattingOptions extends vscode.FormattingOptions {
    eol: string
}

export async function formatIni(code: string, option: IniFormattingOptions): Promise<string> {
    try {
        return await prettier.format(code, {
            plugins: [require('prettier-plugin-ini').default],
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
