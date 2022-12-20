import * as vscode from "vscode";
import { Page } from "../../../domain/entities/theme/page";
import { AttachedComponents, MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { DocumentLink } from "../../types/document-link";

const COMPONENT_TAG = /\{\%\s*component\s+[\'\"]\w+[\'\"]/g;
const COMPONENT_ALIAS = /[\'\"]\w+[\'\"]/;

/**
 * Document links to components in twig section
 *
 * {% component 'blogPost' %}
 */
export class TwigComponent implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const links: vscode.DocumentLink[] = [];

        for (const match of document.getText().matchAll(COMPONENT_TAG)) {
            const aliasMatch = match[0].match(COMPONENT_ALIAS)!;
            const alias = aliasMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + aliasMatch.index! + 1);
            const end = start.translate(0, alias.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const themeFile = Store.instance.findEntity(link.document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const alias = link.markedText;

        let attachedComponents: AttachedComponents = {};

        if (themeFile instanceof Page && themeFile.layout) {
            attachedComponents = {
                ...themeFile.components,
                ...themeFile.layout.components
            };
        } else {
            attachedComponents = themeFile.components;
        }

        const component = attachedComponents[alias];
        if (!component) {
            vscode.window.showErrorMessage('Unknown component');
            return;
        }

        const url = vscode.Uri.file(component.path)
            .with({ fragment: component.classPosition });

        link.target = url;

        return link;
    }
}
