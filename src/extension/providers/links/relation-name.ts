import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { Controller } from '../../../domain/entities/classes/controller';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { Str } from '../../../helpers/str';
import { DocumentLink } from '../../types/document-link';

const RELATION_RENDER = /->relationRender\s*\(\s*[\'\"]\w+[\'\"]/g;
const RELATION_NAME = /[\'\"]\w+[\'\"]/;

/**
 * Document links for relation names in relationRender calls
 */
export class RelationName implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: DocumentLink[] = [];

        const matches = document.getText().matchAll(RELATION_RENDER);
        for (const match of matches) {
            const urlMatch = match[0].match(RELATION_NAME)!;
            const url = urlMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + urlMatch.index! + 1);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    async resolveDocumentLink?(link: DocumentLink): Promise<vscode.DocumentLink | undefined> {
        const owner = Store.instance.findOwner(link.document!.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const controller = owner.findEntityByPath(link.document.fileName)
            || owner.findEntityByRelatedName(link.document.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const configs = controller.getBehaviorConfigPaths('Backend\\Behaviors\\RelationController');
        if (!configs || !configs.default || !FsHelpers.exists(configs.default)) {
            return;
        }

        const regexStr = Str.replaceAll(`${link.markedText}:\s*\r?\n`, '\\', '\\\\');
        const regex = new RegExp(regexStr, 'g');

        const configContent = FsHelpers.readFile(configs.default);
        const behaviorConfig = yaml.parse(configContent);

        const matches = configContent.matchAll(regex);
        for (const match of matches) {
            const relationName = match[0].trim().slice(0, -1);
            if (!behaviorConfig[relationName]) {
                continue;
            }

            const uri = vscode.Uri.file(configs.default);

            const configDocument = await vscode.workspace.openTextDocument(uri);
            const position = configDocument.positionAt(match.index!);

            link.target = uri.with({
                fragment: `L${position.line + 1},${position.character}`
            });

            return link;
        }
    }
}
