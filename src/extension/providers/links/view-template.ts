import * as vscode from "vscode";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { Store } from "../../../domain/services/store";
import { DocumentLink } from "../../types/document-link";
import path = require("path");

const CALL_VIEW = /((::send\s*\()|(::sendTo\s*\(\s*.*,)|(View\s*::\s*make\s*\()|(view\s*\())\s*[\'\"][\w\_\-\.\:]+[\'\"]/g;
const VIEWS = /[\'\"][\w\_\-\.\:]+[\'\"]/g;

/**
 * Document links for view names
 *
 * Mail::send('...')
 * Mail::sendTo($email, '...')
 * View::make(...)
 * view(...)
 */
export class ViewTemplate implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const links: vscode.DocumentLink[] = [];

        const callViewMatches = document.getText().matchAll(CALL_VIEW);
        for (const callMatch of callViewMatches) {
            const viewMatch = [...callMatch[0].matchAll(VIEWS)].reverse()[0];
            const viewName = viewMatch[0].slice(1, -1);

            const start = document.positionAt(callMatch.index! + viewMatch.index! + 1);
            const end = start.translate(0, viewName.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const project = Store.instance.findProject(link.document.fileName);
        if (!project) {
            return;
        }

        const viewName = link.markedText;

        const projectViews = project.views;

        if (!projectViews.includes(viewName)) {
            vscode.window.showErrorMessage('View does not exists');
            return;
        }

        const [ownerCode, viewCode] = viewName.split('::');

        const owner = project.findOwnerByName(ownerCode);
        if (!owner) {
            return;
        }

        let viewPath: string | undefined;

        for (const ext of ['php', 'htm']) {
            const candidate = path.join(owner.path, 'views', ...viewCode.split('.')) + '.' + ext;
            if (FsHelpers.exists(candidate)) {
                viewPath = candidate;
            }
        }

        if (!viewPath) {
            vscode.window.showErrorMessage('View does not exists');
            return;
        }

        link.target = vscode.Uri.file(viewPath);

        return link;
    }
}
