import * as vscode from "vscode";
import { Behavior } from "../../../domain/entities/classes/behavior";
import { Widget } from "../../../domain/entities/classes/widget";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { DocumentLink } from "../../types/document-link";
import path = require("path");

const ADD_ASSET_METHOD = /->\s*(addCss|addCssBundle|addJs|adJsBundle|addRss)\s*\(\s*[\'\"].*?[\'\"]/g;
const URI = /[\'\"].*?[\'\"]/;

/**
 * Document links for addCss(), addCssBundle(), addJs(), adJsBundle() and addRss() methods
 */
export class Asset implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const links: vscode.DocumentLink[] = [];

        const assetsMatches = document.getText().matchAll(ADD_ASSET_METHOD);
        for (const methodMatch of assetsMatches) {
            const matchUri = methodMatch[0].match(URI)!;
            const uri = matchUri[0].slice(1, -1);

            const start = document.positionAt(methodMatch.index! + matchUri.index! + 1);
            const end = start.translate(0, uri.length);
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

        const uri = link.markedText;

        if (uri.startsWith('http')) {
            link.target = vscode.Uri.parse(uri, true);
            return link;
        }

        let assetPath: string | undefined;

        if (uri.startsWith('/')) {
            assetPath = PathHelpers.rootPath(project.path, uri);
        } else {
            const entity = Store.instance.findEntity(link.document!.fileName);
            if (entity instanceof Widget || entity instanceof Behavior) {
                assetPath = path.join(entity.filesDirectory, 'assets', uri);
            }
        }

        if (!assetPath || !FsHelpers.exists(assetPath)) {
            return;
        }

        link.target = vscode.Uri.file(assetPath);

        return link;
    }
}
