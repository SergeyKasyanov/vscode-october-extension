import * as vscode from "vscode";
import { BackendOwner } from "../../../domain/entities/owners/backend-owner";
import { Store } from "../../../domain/services/store";
import { DocumentLink } from "../../types/document-link";

const BACKEND_URL_CALL = /Backend\s*::\s*(url|redirect|redirectGuest|redirectIntended)\s*\(\s*[\'\"][\w\-\_\/]+[\'\"]/g;
const URL = /[\'\"][\w\-\_\/]+[\'\"]/;

/**
 * Document links for Backend::url() calls
 * to corresponding backend controller method
 */
export class BackendUrl implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];

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

        const parts = link.markedText.split('/');

        let code = parts.shift()!;

        let owner = project.findOwnerByName(code) as BackendOwner | undefined;
        if (!owner) {
            code += '.' + parts.shift()!;
            owner = project.findOwnerByName(code) as BackendOwner | undefined;
        }

        if (!owner) {
            return;
        }

        const controllerName = parts.length === 0
            ? 'index'
            : parts.shift();

        const controller = owner.controllers.find(c => c.uqn.toLowerCase() === controllerName);
        if (!controller) {
            vscode.window.showErrorMessage('Unknown controller');
            return;
        }

        link.target = vscode.Uri.file(controller.path);

        const methodName = parts.length === 0
            ? 'index'
            : parts.shift()!;

        const methodRange = controller.pageMethods[methodName];

        if (methodRange) {
            const fragment = 'L' + methodRange.start.line + ',' + methodRange.start.character;
            link.target = link.target.with({ fragment });
        } else {
            link.target = link.target.with({ fragment: controller.classPosition });
        }

        return link;
    }
}
