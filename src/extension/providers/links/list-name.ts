import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { DocumentLink } from '../../types/document-link';

const LIST_RENDER = /->listRender\s*\(\s*[\'\"]\w+[\'\"]/g;
const LIST_NAME = /[\'\"]\w+[\'\"]/;

/**
 * Document links for list names in listRender calls
 */
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

    resolveDocumentLink?(link: DocumentLink): vscode.ProviderResult<DocumentLink> {
        const owner = Store.instance.findOwner(link.document!.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const controller = owner.findEntityByPath(link.document.fileName)
            || owner.findEntityByRelatedName(link.document.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const definition = link.markedText;

        const configs = controller.getBehaviorConfigPaths('Backend\\Behaviors\\ListController');
        if (!configs || !configs[definition] || !FsHelpers.exists(configs[definition])) {
            return;
        }

        link.target = vscode.Uri.file(configs[definition]);

        return link;
    }
}
