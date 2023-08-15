import * as vscode from "vscode";
import { Controller } from "../../../domain/entities/classes/controller";
import { Widget } from "../../../domain/entities/classes/widget";
import { BackendOwner } from "../../../domain/entities/owners/backend-owner";
import { Project } from "../../../domain/entities/project";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import path = require("path");

const PHP_MAKE_PARTIAL_METHODS_GLOBAL = /->\s*(makePartial|makeHintPartial)\s*\(\s*[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/g;
const PARTIAL_NAME = /[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/;

/**
 * Document links for partial names in $this->makePartial('blog/post')
 */
export class MakePartialPath implements vscode.DocumentLinkProvider {

    private entity?: Controller | Widget;
    private project?: Project;

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.entity = Store.instance.findEntity(document.fileName) as Controller | Widget;

        if (this.entity) {
            this.project = this.entity.owner.project;
        } else {
            const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
            this.entity = owner.findEntityByRelatedName(document.fileName) as Controller | Widget;
            this.project = this.entity?.owner.project || Store.instance.findProject(document.fileName);
        }

        if (!this.project) {
            return;
        }

        const links: vscode.DocumentLink[] = [];

        const makePartialMatches = document.getText().matchAll(PHP_MAKE_PARTIAL_METHODS_GLOBAL);
        for (const match of makePartialMatches) {
            const partialPathMatch = match[0].match(PARTIAL_NAME)!;
            const partialPath = this.partialPath(partialPathMatch[0].slice(1, -1));
            if (!partialPath || !FsHelpers.exists(partialPath)) {
                continue;
            }

            const start = document.positionAt(match.index! + partialPathMatch.index! + 1);
            const end = start.translate(0, partialPathMatch[0].length - 2);
            const range = new vscode.Range(start, end);
            const url = vscode.Uri.file(partialPath);

            links.push(new vscode.DocumentLink(range, url));
        }

        return links;
    }

    /**
     * Build partial path
     *
     * @param name
     * @returns
     */
    private partialPath(name: string): string | undefined {
        if (name.startsWith('~')) {
            let partialPath = name.slice(1);
            if (partialPath.startsWith('/')) {
                partialPath = partialPath.slice(1);
            }

            return PathHelpers.rootPath(this.project!.path, partialPath);
        } else if (name.startsWith('$')) {
            let partialPath = name.slice(1);
            if (partialPath.startsWith('/')) {
                partialPath = partialPath.slice(1);
            }

            return PathHelpers.pluginsPath(this.project!.path, partialPath);
        } else if (this.entity instanceof Controller) {
            let nameParts = name.split('/');

            const fileName = nameParts.pop();

            for (const ext of this.project!.platform!.backendViewExtensions) {
                const candidate = path.join(this.entity!.filesDirectory, ...nameParts, '_' + fileName + '.' + ext);
                if (FsHelpers.exists(candidate)) {
                    return candidate;
                }
            }
        } else if (this.entity instanceof Widget) {
            let nameParts = name.split('/');

            const fileName = nameParts.pop();

            for (const ext of this.project!.platform!.backendViewExtensions) {
                const candidate = path.join(this.entity!.filesDirectory, 'partials', ...nameParts, '_' + fileName + '.' + ext);
                if (FsHelpers.exists(candidate)) {
                    return candidate;
                }
            }
        }
    }
}
