import * as vscode from "vscode";
import { Controller } from "../../../domain/entities/classes/controller";
import { Model } from "../../../domain/entities/classes/model";
import { OctoberClass } from "../../../domain/entities/classes/october-class";
import { BackendOwner } from "../../../domain/entities/owners/backend-owner";
import { Project } from "../../../domain/entities/project";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { Str } from "../../../helpers/str";
import { YamlHelpers } from "../../helpers/yaml-helpers";
import { DocumentLink as _DocumentLInk } from '../../types/document-link';
import path = require("path");

const PATH_PAIR = /(path|toolbarPartial|buttons|form|list|groups|filter):\s*[\$\~]{0,1}[\'\"]{0,1}[\w\-\_\.\/]+[\'\"]{0,1}/g;
const MODEL_CLASS_PAIR = /modelClass:\s*[\w\\\_]+/g;

/**
 * Document links for partials, configs and models in yaml configs
 */
export class YamlFiles implements vscode.DocumentLinkProvider {

    private document?: vscode.TextDocument;
    private project?: Project;
    private entity?: OctoberClass;

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.document = document;
        this.project = Store.instance.findProject(document.fileName);
        if (!this.project) {
            return;
        }

        const owner = this.project.findOwner(document.fileName) as BackendOwner;
        this.entity = owner!.findEntityByRelatedName(document.fileName) as OctoberClass;

        return [
            ...this.processMatches(document, this.document!.getText().matchAll(PATH_PAIR), 'file'),
            ...this.processMatches(document, this.document!.getText().matchAll(MODEL_CLASS_PAIR), 'model')
        ];
    }

    private processMatches(
        document: vscode.TextDocument,
        matches: IterableIterator<RegExpMatchArray>,
        mode: 'file' | 'model'
    ): DocumentLink[] {
        const links = [];

        for (const match of matches) {
            const line = this.document!.positionAt(match.index!).line;
            const value = YamlHelpers.getKeyAndValue(this.document!.lineAt(line).text).value;
            if (!value) {
                continue;
            }

            const valueOffset = match[0].indexOf(value);

            const start = document.positionAt(match.index! + valueOffset);
            const end = start.translate(0, value.length);
            const range = new vscode.Range(start, end);

            const link = new DocumentLink(document, range);
            link.mode = mode;

            links.push(link);
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink> {
        const value = link.markedText;

        if (link.mode === 'file') {
            let controller: Controller | undefined;

            if (this.entity instanceof Model) {
                controller = this.entity!.controller;
            } else if (this.entity instanceof Controller) {
                controller = this.entity!;
            }

            const filePath = PathHelpers.relativePath(
                this.project!.path,
                value,
                controller
            );

            if (filePath && FsHelpers.exists(filePath) && FsHelpers.isFile(filePath)) {
                link.target = vscode.Uri.file(filePath);

                return link;
            }

            vscode.window.showErrorMessage('File does not exists');
            return;
        } else if (link.mode === 'model') {
            const modelFqn = value.startsWith('\\')
                ? value.slice(1)
                : value;

            const model = this.project!.models.find(m => m.fqn === modelFqn);
            if (!model) {
                vscode.window.showErrorMessage('Model does not exists');
                return;
            }

            link.target = vscode.Uri.file(model.path);

            return link;
        }
    }
}

class DocumentLink extends _DocumentLInk {
    mode?: 'file' | 'model';
}
