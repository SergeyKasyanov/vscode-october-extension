import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Store } from '../../../domain/services/store';
import { DocumentLink as BaseDocumentLink } from '../../types/document-link';

const ACTION_METHOD_CALL = /->actionUrl\s*\(\s*[\'\"][\w\-\_\/]+[\'\"]/g;
const ACTION_NAME = /[\'\"][\w\-\_\/]+[\'\"]/;

/**
 * Document links for controller action in $this->actionUrl('...')
 */
export class ControllerAction implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<DocumentLink[]> {

        let controller: Controller = Store.instance.findEntity(document.fileName) as Controller;

        if (!(controller instanceof Controller)) {
            const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
            if (!(owner instanceof BackendOwner)) {
                return;
            }

            controller = owner.findEntityByRelatedName(document.fileName) as Controller;
        }

        if (!(controller instanceof Controller)) {
            return;
        }

        const links: DocumentLink[] = [];

        const callMatches = document.getText().matchAll(ACTION_METHOD_CALL);
        for (const match of callMatches) {
            const actionMatch = match[0].match(ACTION_NAME)!;
            const action = actionMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + actionMatch.index! + 1);
            const end = start.translate(0, action.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, controller, range));
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink): vscode.ProviderResult<DocumentLink> {
        const pages = link.controller.pageMethods;
        const uri = vscode.Uri.file(link.controller.path);

        let actionName = link.markedText;
        if (actionName === '/') {
            actionName = 'index';
        }

        const actionRange = pages[link.markedText];

        link.target = actionRange
            ? uri.with({fragment: `L${actionRange.start.line},${actionRange.start.character}`})
            : uri.with({fragment: link.controller.classPosition});

        return link;
    }
}

class DocumentLink extends BaseDocumentLink {
    constructor(
        public document: vscode.TextDocument,
        public controller: Controller,
        range: vscode.Range,
        target?: vscode.Uri
    ) {
        super(document, range, target);
    }
}
