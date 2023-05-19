import * as vscode from 'vscode';
import { DocumentLink } from '../../types/document-link';
import { Store } from '../../../domain/services/store';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Widget } from '../../../domain/entities/classes/widget';

const GET_EVENT_HANDLER_CALL = /->getEventHandler\s*\(\s*[\'\"][\w\_]+[\'\"]/g;
const HANDLER_NAME = /[\'\"][\w\_]+[\'\"]/;

export class EventHandler implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<DocumentLink[]> {
        const links: DocumentLink[] = [];

        const methodsMatches = document.getText().matchAll(GET_EVENT_HANDLER_CALL);
        for (const match of methodsMatches) {
            const handlerMatch = match[0].match(HANDLER_NAME)!;
            const handler = handlerMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + handlerMatch.index! + 1);
            const end = start.translate(0, handler.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink?(link: DocumentLink): vscode.ProviderResult<DocumentLink> {
        const owner = Store.instance.findOwner(link.document!.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const widget = owner.findEntityByRelatedName(link.document!.fileName) as Widget;
        if (!(widget instanceof Widget)) {
            return;
        }

        const methods = widget.phpClassMethods;
        if (!methods) {
            return;
        }

        const handler = methods[link.markedText];
        if (!handler) {
            return;
        }

        link.target = widget.uri.with({
            fragment: `L${handler.loc!.start.line},${handler.loc!.start.column}`
        });

        return link;
    }
}
