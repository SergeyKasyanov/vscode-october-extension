import * as vscode from "vscode";
import { Section } from "../../../../domain/entities/theme/theme-file";
import prettier = require('prettier');

const STYLE_TAG = /\<style\>(.|\r?\n)*\<\/style\>/g;
const SCRIPT_TAG = /\<script\>(.|\r?\n)*\<\/script\>/g;

export interface TwigFormattingOptions extends vscode.FormattingOptions {
    eol: string;
    onlyTwig: boolean
}

/**
 * Format twig section of file
 */
export async function formatTwig(
    code: Section,
    document: vscode.TextDocument,
    options: TwigFormattingOptions
) {
    const twigCode = code.text.trim();

    try {
        let formatted = await prettier.format(twigCode, {
            plugins: [require('prettier-plugin-jinja-template')],
            parser: 'jinja-template',
            printWidth: 120,
            tabWidth: options!.tabSize,
            useTabs: !options!.insertSpaces,
        });

        formatted = await formatStyles(formatted, code.offset, options, document);
        formatted = await formatScripts(formatted, code.offset, options, document);

        let result = (options.onlyTwig ? '' : '==' + options.eol) + formatted;

        if (options.onlyTwig && result.startsWith('==')) {
            result = result.slice(2);
        }

        return result;
    } catch (err) {
        console.error(err);

        let result = (options.onlyTwig ? '' : '==' + options.eol) + twigCode;

        if (options.onlyTwig && result.startsWith('==')) {
            result = result.slice(2);
        }

        return result;
    }
}

/**
 * Format css code inside style tags
 */
async function formatStyles(twigCode: string, twigOffset: number, options: TwigFormattingOptions, document: vscode.TextDocument) {
    const styleMatches = twigCode.matchAll(STYLE_TAG);

    for (const match of styleMatches) {
        try {
            const line = document.positionAt(twigOffset + match.index).line;
            const lineText = document.lineAt(line).text;
            const indentMatch = lineText.match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';

            const size = match[0].length;
            const css = match[0].slice('<style>'.length, -1 * '</style>'.length);

            let formatted: string = await prettier.format(css, {
                plugins: [require('prettier/parser-postcss')],
                parser: 'css',
                tabWidth: options!.tabSize,
                useTabs: !options!.insertSpaces
            });

            formatted = formatted
                .split(/\r?\n/)
                .map(line => line.length > 0 ? indent + line : line)
                .join(options.eol);

            const begin = twigCode.slice(0, match.index!);
            const end = twigCode.slice(match.index! + size);

            twigCode = begin + '<style>' + options.eol + formatted + indent + '</style>' + end;
        } catch (err) {
            console.error(err);
        }
    }

    return twigCode;
}

/**
 * Format javascript code inside script tags
 */
async function formatScripts(twigCode: string, twigOffset: number, options: TwigFormattingOptions, document: vscode.TextDocument) {
    const scriptMatches = twigCode.matchAll(SCRIPT_TAG);

    for (const match of scriptMatches) {
        try {
            const line = document.positionAt(twigOffset + match.index).line;
            const lineText = document.lineAt(line).text;
            const indentMatch = lineText.match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';

            const size = match[0].length;
            const script = match[0].slice('<script>'.length, -1 * '</script>'.length);

            let formatted: string = await prettier.format(script, {
                plugins: [require('prettier/parser-babel')],
                parser: 'babel',
                tabWidth: options!.tabSize,
                useTabs: !options!.insertSpaces
            });

            formatted = formatted
                .split(/\r?\n/)
                .map(line => line.length > 0 ? indent + line : line)
                .join(options.eol);

            const begin = twigCode.slice(0, match.index!);
            const end = twigCode.slice(match.index! + size);

            twigCode = begin + '<script>' + options.eol + formatted + indent + '</script>' + end;
        } catch (err) {
            console.error(err);
        }
    }

    return twigCode;
}
