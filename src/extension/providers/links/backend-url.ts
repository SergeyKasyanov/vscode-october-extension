import * as vscode from "vscode";
import { Store } from "../../../domain/services/store";
import { resolveBackendController } from "../../helpers/resolve-backend-controller";
import { DocumentLink } from "../../types/document-link";

const BACKEND_URL_CALL = /Backend\s*::\s*(url|redirect|redirectGuest|redirectIntended)\s*\(\s*[\'\"][\w\-\_\/]+[\'\"]/g;
const URL = /[\'\"][\w\-\_\/]+[\'\"]/;

/**
 * Document links for Backend::url() calls
 * to corresponding backend controller method
 */
export class BackendUrl implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: DocumentLink[] = [];

        const methodsMatches = document.getText().matchAll(BACKEND_URL_CALL);
        for (const match of methodsMatches) {
            const urlMatch = match[0].match(URL)!;
            const url = urlMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + urlMatch.index! + 1);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const project = Store.instance.findProject(link.document!.fileName);
        if (!project) {
            return;
        }

        const resolved = resolveBackendController(project, link.markedText);
        if (!resolved?.controller) {
            vscode.window.showErrorMessage('Unknown controller');
            return;
        }

        const { controller, range } = resolved;

        link.target = vscode.Uri.file(controller.path);

        if (range) {
            const fragment = 'L' + range.start.line + ',' + range.start.character;
            link.target = link.target.with({ fragment });
        } else {
            link.target = link.target.with({ fragment: controller.classPosition });
        }

        return link;
    }
}
