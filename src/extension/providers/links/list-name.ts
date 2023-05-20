import * as vscode from 'vscode';
import { DocumentLink } from '../../types/document-link';

const LIST_RENDER = /->listRender\s*\(\s*[\'\"]\w+[\'\"]/g;
const LIST_NAME = /[\'\"]\w+[\'\"]/;

export class ListName implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<DocumentLink[]> {
        const links: DocumentLink[] = [];

        const matches = document.getText().matchAll(LIST_RENDER);
        for (const match of matches) {
            const urlMatch = match[0].match(LIST_NAME)!;
            const url = urlMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + urlMatch.index! + 1);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    // resolveDocumentLink?(link: DocumentLink): vscode.ProviderResult<DocumentLink> {

    // }
}
