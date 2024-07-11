import * as vscode from 'vscode';
import { Component } from "../entities/classes/component";
import { AttachedComponents, MarkupFile } from "../entities/theme/theme-file";
import { Page } from '../entities/theme/page';
import { Section } from '../../extension/helpers/split-markup';

let attachments: string[] = [];

/**
 * Find all components usages in themes files
 */
export async function findComponentUsages(component: Component) {
    const project = component.owner.project;

    const defaultAlias = component.defaultAlias;

    attachments = [
        '[' + component.fqn,
        '[\\' + component.fqn
    ];

    if (defaultAlias) {
        attachments.push('[' + defaultAlias);
    }

    const locations = [];

    for (const theme of project.themes) {
        for (const layout of theme.layouts) {
            locations.push(...(await findUsagesInFile(layout, component)));
        }

        for (const page of theme.pages) {
            locations.push(...(await findUsagesInFile(page, component)));
        }

        for (const partial of theme.partials) {
            locations.push(...(await findUsagesInFile(partial, component)));
        }
    }

    return locations;
}

async function findUsagesInFile(file: MarkupFile, component: Component): Promise<vscode.Location[]> {
    const sections = file.sections;

    const locations: vscode.Location[] = [];

    if (sections.ini) {
        locations.push(...findUsagesInIni(sections.ini, file.uri));
    }

    if (sections.twig) {
        locations.push(...(await findUsagesInTwig(sections.twig, component, file)));
    }

    return locations;
}

function findUsagesInIni(ini: Section, fileUri: vscode.Uri) {
    const locations: vscode.Location[] = [];

    const lines = ini.text.split(/\r?\n/);
    for (let line = 0; line < lines.length; line++) {
        const lineText = lines[line];
        if (!lineText.startsWith('[')) {
            continue;
        }

        for (const att of attachments) {
            if (lineText.startsWith(att)) {
                const start = new vscode.Position(line, 1);
                const end = new vscode.Position(line, att.length);

                locations.push(new vscode.Location(fileUri, new vscode.Range(start, end)));
            }
        }
    }

    return locations;
}

async function findUsagesInTwig(twig: Section, component: Component, file: MarkupFile) {
    const locations: vscode.Location[] = [];

    let aliases: string[] = lookForAliases(file.components, component);

    if (file instanceof Page && file.layout) {
        aliases.push(...lookForAliases(file.layout.components, component));
    }

    if (aliases.length === 0) {
        return locations;
    }

    const document = await vscode.workspace.openTextDocument(file.uri);

    for (const alias of aliases) {
        const renderComponent = new RegExp(`\\{\\%\\s*component\\s*['"]${alias}['"]`, 'g');
        const componentMethod = new RegExp(`${alias}\\.`, 'g');
        const ajaxRequest = new RegExp(`data-(request|handler)=['"]${alias}::`, 'g');

        const renderMatches = twig.text.matchAll(renderComponent);
        for (const match of renderMatches) {
            const index = match[0].indexOf(alias);

            const start = document.positionAt(twig.offset + match.index + index);
            const end = start.translate(0, alias.length);

            locations.push(new vscode.Location(file.uri, new vscode.Range(start, end)));
        }

        const methodMatches = twig.text.matchAll(componentMethod);
        for (const match of methodMatches) {
            const start = document.positionAt(twig.offset + match.index);
            const end = start.translate(0, alias.length);

            locations.push(new vscode.Location(file.uri, new vscode.Range(start, end)));
        }

        const ajaxRequestMatches = twig.text.matchAll(ajaxRequest);
        for (const match of ajaxRequestMatches) {
            const index = match[0].indexOf(alias);

            const start = document.positionAt(twig.offset + match.index + index);
            const end = start.translate(0, alias.length);

            locations.push(new vscode.Location(file.uri, new vscode.Range(start, end)));
        }
    }

    return locations;
}

function lookForAliases(attachedComponents: AttachedComponents, component: Component): string[] {
    const aliases = [];

    for (const alias in attachedComponents) {
        if (Object.prototype.hasOwnProperty.call(attachedComponents, alias)) {
            const comp = attachedComponents[alias];
            if (comp.fqn === component.fqn) {
                aliases.push(alias);
            }
        }
    }

    return aliases;
}
