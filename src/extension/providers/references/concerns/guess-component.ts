import * as vscode from 'vscode';
import { Component } from '../../../../domain/entities/classes/component';
import { Page } from '../../../../domain/entities/theme/page';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';
import { Store } from '../../../../domain/services/store';

const COMPONENT_ATTACHMENT = /\[[\w\\]+(\s\w+)?\]/g;
const COMPONENT_NAME_IN_ATTACHMENT = /[\w\\]+/g;
const COMPONENT_RENDERS = /\{\%\s*component\s+['"][\w_]+['"]/g;
const COMPONENT_NAME_QUOTED = /['"][\w_]+['"]/;
const COMPONENT_NAME_DOT = /[\w_]+\./g;
const COMPONENT_NAME_IN_DATA_REQUEST = /data-(request|handler)=['"][\w_]+::/g;

/**
 * Guess component clicked in theme file
 */
export function guessClickedComponent(
    document: vscode.TextDocument,
    position: vscode.Position
): Component | undefined {
    const project = Store.instance.findProject(document.fileName);
    if (!project) {
        return;
    }

    let componentName;
    const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
    if (!(themeFile instanceof MarkupFile)) {
        return;
    }

    const offset = document.offsetAt(position);

    if (themeFile.isOffsetInsideIni(offset)) {
        componentName = guessComponentClickedInIni(document, position);
    } else if (themeFile.isOffsetInsideTwig(offset)) {
        componentName = guessComponentClickedInTwig(document, position);
    }

    if (!componentName) {
        return;
    }

    const fileComponents = themeFile.components;
    for (const alias in fileComponents) {
        if (Object.prototype.hasOwnProperty.call(fileComponents, alias)) {
            const component = fileComponents[alias];
            if (alias === componentName || component.fqn === componentName) {
                return component;
            }
        }
    }

    if (themeFile instanceof Page && themeFile.layout) {
        const layoutComponents = themeFile.layout.components;
        for (const alias in layoutComponents) {
            if (Object.prototype.hasOwnProperty.call(layoutComponents, alias)) {
                const component = layoutComponents[alias];
                if (alias === componentName || component.fqn === componentName) {
                    return component;
                }
            }
        }
    }
}

function guessComponentClickedInIni(
    document: vscode.TextDocument,
    position: vscode.Position
): string | undefined {
    const lineText = document.lineAt(position).text;
    const match = lineText.match(COMPONENT_ATTACHMENT);
    if (!match) {
        return;
    }

    const clickedRange = document.getWordRangeAtPosition(position, COMPONENT_NAME_IN_ATTACHMENT);
    if (!clickedRange) {
        return;
    }

    const clicked = document.getText(clickedRange);
    const aliasDividerIndex = lineText.indexOf(' ');

    // if aliasDividerIndex === -1 - it is fine
    // because anyway we need -1 if space is not found
    const componentName = lineText.slice(1, aliasDividerIndex);

    if (clicked !== componentName) {
        return;
    }

    return componentName;
}

function guessComponentClickedInTwig(
    document: vscode.TextDocument,
    position: vscode.Position
): string | undefined {
    return guessRenderedComponent(document, position)
        || guessComponentInDataRequest(document, position)
        || guessDottedComponent(document, position);
}

function guessRenderedComponent(
    document: vscode.TextDocument,
    position: vscode.Position
) {
    const clickedRange = document.getWordRangeAtPosition(position, COMPONENT_NAME_QUOTED);
    if (!clickedRange) {
        return;
    }

    const clickedWord = document.getText(clickedRange);

    const renderedComponents = document.getText().matchAll(COMPONENT_RENDERS);
    for (const match of renderedComponents) {
        const matchRange = new vscode.Range(
            document.positionAt(match.index),
            document.positionAt(match.index).translate(0, match[0].length)
        );

        if (!matchRange.contains(position)) {
            continue;
        }

        const renderedQuotedMatch = match[0].match(COMPONENT_NAME_QUOTED);

        if (renderedQuotedMatch![0] === clickedWord) {
            return clickedWord.slice(1, -1);
        }
    }
}

function guessDottedComponent(
    document: vscode.TextDocument,
    position: vscode.Position
) {
    const clickedRange = document.getWordRangeAtPosition(position, COMPONENT_NAME_DOT);
    if (!clickedRange) {
        return;
    }

    const clickedWord = document.getText(clickedRange);

    const componentMethod = document.getText().matchAll(COMPONENT_NAME_DOT);
    for (const match of componentMethod) {
        const matchRange = new vscode.Range(
            document.positionAt(match.index),
            document.positionAt(match.index).translate(0, match[0].length)
        );

        if (matchRange.contains(position)) {
            return clickedWord.slice(0, -1);
        }
    }
}

function guessComponentInDataRequest(
    document: vscode.TextDocument,
    position: vscode.Position
): string | undefined {
    const clickedRange = document.getWordRangeAtPosition(position, COMPONENT_NAME_IN_DATA_REQUEST);
    if (!clickedRange) {
        return;
    }

    const clickedWord = document.getText(clickedRange);
    return clickedWord.slice(
        clickedWord.indexOf('=') + 2,
        clickedWord.indexOf('::')
    );
}
