import * as vscode from "vscode";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Project } from "../../../../domain/entities/project";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const SET_CONTEXT_FIRST = /::setContext\s*\(\s*[\'\"]/g;
const SET_CONTEXT_SECOND = /::setContext\s*\(\s*[\'\"][\w\.]*[\'\"]\s*,\s*[\'\"]/g;
const SET_CONTEXT_THIRD = /::setContext\s*\(\s*[\'\"][\w\.]*[\'\"]\s*,\s*[\'\"]\w*[\'\"]\s*,\s*[\'\"]/g;

const FIRST_PARAM_PART = /^[\w\.]*$/;
const FIRST_PARAM = /[\w\.]+/;

const PARAM_PART = /^\w*$/;
const PARAM = /\w+/;

/**
 * Completions for BackendMenu::setContext() params
 *
 * BackendMenu::setContext('...', '...', '...')
 */
export class MenuContext implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private project?: Project;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!document.fileName.endsWith('.php')) {
            return;
        }

        this.project = Store.instance.findProject(document.fileName);
        if (!this.project) {
            return;
        }

        this.document = document;
        this.position = position;

        const content = document.getText();
        const offset = document.offsetAt(position);

        if (awaitsCompletions(content, offset, SET_CONTEXT_FIRST, FIRST_PARAM_PART)) {
            return this.getOwner();
        }

        const secondParamOffset = awaitsCompletions(content, offset, SET_CONTEXT_SECOND, PARAM_PART);
        if (secondParamOffset) {
            return this.getMainMenu(secondParamOffset);
        }

        const thirdParamOffset = awaitsCompletions(content, offset, SET_CONTEXT_THIRD, PARAM_PART);
        if (thirdParamOffset) {
            return this.getSideMenu(thirdParamOffset);
        }
    }

    private getOwner(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return this.project!.contextOwners.map(code => {
            const item = new vscode.CompletionItem(code, vscode.CompletionItemKind.Module);
            item.range = this.document!.getWordRangeAtPosition(this.position!, FIRST_PARAM);

            return item;
        });
    }

    private getMainMenu(paramOffset: number): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const currentOffset = this.document!.offsetAt(this.position!);
        const callMethodText = this.document!.getText().slice(paramOffset, currentOffset);

        const ownerMatch = callMethodText.replace('::setContext', '').match(FIRST_PARAM);
        if (!ownerMatch) {
            return;
        }

        const contextOwner = ownerMatch[0];

        const owner = this.findOwner(contextOwner);
        if (!owner) {
            return;
        }

        return Object.keys(owner?.navigation).map(
            code => new vscode.CompletionItem(code, vscode.CompletionItemKind.EnumMember)
        );
    }

    private getSideMenu(paramOffset: number): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const currentOffset = this.document!.offsetAt(this.position!);
        const callMethodText = this.document!.getText().slice(paramOffset, currentOffset);

        const ownerMatch = callMethodText.replace('::setContext', '').match(FIRST_PARAM);
        if (!ownerMatch) {
            return;
        }

        const contextOwner = ownerMatch[0];

        const owner = this.findOwner(contextOwner);
        if (!owner) {
            return;
        }

        const mainMenuMatch = callMethodText.replace('::setContext', '').slice(ownerMatch.index! + contextOwner.length).match(PARAM);
        if (!mainMenuMatch) {
            return;
        }

        const mainMenuCode = mainMenuMatch[0];

        return owner.navigation[mainMenuCode]?.map(code => new vscode.CompletionItem(code, vscode.CompletionItemKind.EnumMember));
    }

    private findOwner(contextOwner: string) {
        let owner: BackendOwner | undefined;
        if (this.project!.appDir && (contextOwner === this.project!.appDir.contextOwner)) {
            owner = this.project!.appDir;
        }

        if (!owner) {
            owner = this.project!.plugins.find(p => p.contextOwner === contextOwner);
        }

        if (!owner) {
            owner = this.project!.modules.find(m => m.contextOwner === contextOwner);
        }

        return owner;
    }
}
