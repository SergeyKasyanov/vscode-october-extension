import * as vscode from "vscode";
import { Component } from "../../../../domain/entities/classes/component";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const PROPERTY_METHOD = /->property\s*\(\s*[\'\"]/g;
const PROPERTY_NAME_PART = /^[\w\-\_]*$/;

/**
 * Completions for component properties inside component class methods
 *
 * $this->property('...')
 */
export class ComponentProperty implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const component = Store.instance.findEntity(document.fileName);
        if (!(component instanceof Component)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            PROPERTY_METHOD,
            PROPERTY_NAME_PART
        )) {
            return;
        }

        return component.properties.map(
            property => CompletionItem.fromComponentProperty(property)
        );
    }
}
