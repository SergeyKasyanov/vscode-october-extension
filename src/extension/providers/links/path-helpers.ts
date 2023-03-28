import path = require("path");
import * as vscode from "vscode";
import { Config } from "../../../config";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { Store } from "../../../domain/services/store";
import { DocumentLink as BaseDocumentLink } from "../../types/document-link";

const PATH_HELPER = /(plugins|themes|storage|temp|app|base|config|lang|public)_path\s*\(\s*[\'\"][\w\/\-\_\.]+[\'\"]/g;
const PATH = /[\'\"][\w\/\-\_\.]+[\'\"]/;

/**
 * Document links for path helpers
 *
 * plugins_path('....');
 * themes_path('....');
 * storage_path('....');
 * temp_path('....');
 * app_path('....');
 * base_path('....');
 * config_path('....');
 * lang_path('....');
 * public_path('....');
 */
export class PathHelpers implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];

        const matches = document.getText().matchAll(PATH_HELPER);
        for (const match of matches) {
            const urlMatch = match[0].match(PATH)!;
            const url = urlMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + urlMatch.index! + 1);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            const link = new DocumentLink(document, range);
            link.matchedPathHelper = match[0];
            links.push(link);
        }

        return links;
    }

    resolveDocumentLink?(link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const project = Store.instance.findProject(link.document!.fileName);
        if (!project) {
            return;
        }

        let root: string | undefined;
        if (link.matchedPathHelper!.startsWith('plugins_path')) {
            root = path.join(project.path, Config.pluginsDirectory);
        } else if (link.matchedPathHelper!.startsWith('themes_path')) {
            root = path.join(project.path, Config.themesDirectory);
        } else if (link.matchedPathHelper!.startsWith('storage_path')) {
            root = path.join(project.path, 'storage');
        } else if (link.matchedPathHelper!.startsWith('temp_path')) {
            root = path.join(project.path, 'storage', 'temp');
        } else if (project.platform?.hasAppDirectory && link.matchedPathHelper!.startsWith('app_path')) {
            root = path.join(project.path, 'app');
        } else if (link.matchedPathHelper!.startsWith('base_path')) {
            root = project.path;
        } else if (link.matchedPathHelper!.startsWith('config_path')) {
            root = path.join(project.path, 'config');
        } else if (project.platform?.hasAppDirectory && link.matchedPathHelper!.startsWith('lang_path')) {
            root = path.join(project.path, 'app', 'lang');
        } else if (link.matchedPathHelper!.startsWith('public_path')) {
            root = path.join(project.path, 'public');
            if (!FsHelpers.exists(root)) {
                root = project.path;
            }
        }

        if (!root) {
            return;
        }

        const filePath = path.join(root, ...link.markedText.split('/'));

        link.target = vscode.Uri.file(filePath);

        return link;
    }
}

class DocumentLink extends BaseDocumentLink {
    matchedPathHelper?: string;
}
