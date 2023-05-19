import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../../domain/helpers/path-helpers";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { getPathCompletions } from "../../../helpers/path-autocomplete";
import path = require("path");
import { Widget } from "../../../../domain/entities/classes/widget";

const MAKE_PARTIAL_METHOD = /->\s*(makePartial|makeHintPartial)\s*\(\s*[\'\"]/g;
const PARTIAL_NAME_PART = /^(\$|\~){0,1}[\w\/\-\_\.]*$/;
const PARTIAL_NAME = /(\$|\~){0,1}[\w\/\-\_\.]+/;

/**
 * Completions for partial name in controller's makePartial method
 *
 * $this->makePartial('...')
 */
export class PartialName implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            MAKE_PARTIAL_METHOD,
            PARTIAL_NAME_PART
        )) {
            return;
        }

        let entered = '';

        const enteredRange = document.getWordRangeAtPosition(position, PARTIAL_NAME);
        if (enteredRange) {
            const lineText = document.lineAt(enteredRange.start.line).text;
            entered = lineText.slice(enteredRange.start.character, enteredRange.end.character);
        }

        if (entered.startsWith('$')) {
            return this.getPrefixedPathCompletions(
                PathHelpers.pluginsPath(owner.project.path),
                '$',
                entered.slice(1),
                owner.project.platform!.backendViewExtensions
            )?.map(item => {
                item.range = document.getWordRangeAtPosition(position, PARTIAL_NAME);
                return item;
            });
        }

        if (entered.startsWith('~')) {
            return this.getPrefixedPathCompletions(
                PathHelpers.rootPath(owner.project.path),
                '~',
                entered.slice(1),
                owner.project.platform!.backendViewExtensions
            )?.map(item => {
                item.range = document.getWordRangeAtPosition(position, PARTIAL_NAME);
                return item;
            });
        }

        let viewsDirectory: string | undefined;

        const entity = owner.findEntityByPath(document.fileName)
            || owner.findEntityByRelatedName(document.fileName);
        if (entity instanceof Controller) {
            viewsDirectory = entity.filesDirectory;
        }

        if (entity instanceof Widget) {
            viewsDirectory = path.join(entity.filesDirectory, 'partials');
        }

        if (!viewsDirectory || !FsHelpers.exists(viewsDirectory)) {
            return;
        }

        return this.getPathCompletions(viewsDirectory, owner.project.platform!.backendViewExtensions);

    }

    private getPrefixedPathCompletions(rootDir: string, prefixSymbol: string, entered: string, exts: string[]) {
        const prefix = entered !== '' ? prefixSymbol : '';

        if (!entered.endsWith('/')) {
            entered += '/';
        }

        return getPathCompletions(rootDir, entered, exts, prefix);
    }

    private getPathCompletions(viewsDirectory: string, exts: string[]) {
        return FsHelpers
            .listFiles(viewsDirectory, true, exts)
            .map(file => {
                let fileParts = file.split(path.sep);
                if (fileParts[0] === '') {
                    fileParts.shift();
                }

                let name = fileParts.pop();
                if (!name) {
                    return;
                }

                if (!name.startsWith('_')) {
                    return;
                }

                fileParts.push(name.slice(1, -4));

                return fileParts.join('/');
            })
            .filter(file => !!file)
            .map(file => {
                const item = new vscode.CompletionItem(file!, vscode.CompletionItemKind.File);
                item.range = this.document!.getWordRangeAtPosition(this.position!, PARTIAL_NAME);

                return item;
            });
    }
}
