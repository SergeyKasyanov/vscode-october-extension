/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";

export interface TwigTest {
    name: string,
    snippet: string,
    doc: vscode.MarkdownString,
}

export interface TwigTestList {
    [name: string]: TwigTest
}

export const twigTests: TwigTestList = {
    even: {
        name: 'even',
        snippet: 'even',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/even.html)`)
    },
    'not even': {
        name: 'not even',
        snippet: 'not even',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/even.html)`)
    },
    odd: {
        name: 'odd',
        snippet: 'odd',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/odd.html)`)
    },
    'not odd': {
        name: 'not odd',
        snippet: 'not odd',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/odd.html)`)
    },
    defined: {
        name: 'defined',
        snippet: 'defined',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/defined.html)`)
    },
    'not defined': {
        name: 'not defined',
        snippet: 'not defined',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/defined.html)`)
    },
    'same as': {
        name: 'same as',
        snippet: 'same as',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/sameas.html)`)
    },
    'not same as': {
        name: 'not same as',
        snippet: 'not same as',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/sameas.html)`)
    },
    none: {
        name: 'none',
        snippet: 'none',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/none.html)`)
    },
    'not none': {
        name: 'not none',
        snippet: 'not none',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/none.html)`)
    },
    null: {
        name: 'null',
        snippet: 'null',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/null.html)`)
    },
    'not null': {
        name: 'not null',
        snippet: 'not null',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/null.html)`)
    },
    'divisible by': {
        name: 'divisible by',
        snippet: 'divisible by',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/divisibleby.html)`)
    },
    'not divisible by': {
        name: 'not divisible by',
        snippet: 'not divisible by',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/divisibleby.html)`)
    },
    constant: {
        name: 'constant',
        snippet: 'constant',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/constant.html)`)
    },
    'not constant': {
        name: 'not constant',
        snippet: 'not constant',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/constant.html)`)
    },
    empty: {
        name: 'empty',
        snippet: 'empty',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/empty.html)`)
    },
    'not empty': {
        name: 'not empty',
        snippet: 'not empty',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/empty.html)`)
    },
    iterable: {
        name: 'iterable',
        snippet: 'iterable',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/iterable.html)`)
    },
    'not iterable': {
        name: 'not iterable',
        snippet: 'not iterable',
        doc: new vscode.MarkdownString(`[Documentation](https:\/\/twig.symfony.com\/doc\/3.x\/tests\/iterable.html)`)
    }
};
