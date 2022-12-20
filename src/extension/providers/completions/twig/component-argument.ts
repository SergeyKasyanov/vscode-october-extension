import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const COMPONENT_TAG = /\{\%\s*component\s+[\'\"][\w\/\-.]+[\'\"]\s*/g;
const COMPONENT_TAG_ARGS = /^(\s*\w+\s*=\s*([\'\"]{0,1}[а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]*[\'\"]{0,1}))*$/;
const COMPONENT_NAME = /[\'\"][\w\/\-.]+[\'\"]/;

/**
 * Completions for component property names in twig component tag.
 *
 * {% component 'compName' propName =  %}
 */
export class ComponentArgument implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        const offset = document.offsetAt(position);

        const matchStart = awaitsCompletions(
            document.getText(),
            offset,
            COMPONENT_TAG,
            COMPONENT_TAG_ARGS
        );

        if (!matchStart) {
            return;
        }

        let component;
        const componentAlias = document.getText().slice(matchStart, offset).match(COMPONENT_NAME)![0].slice(1, -1);

        const fileComponents = themeFile.components;
        for (const alias in fileComponents) {
            if (Object.prototype.hasOwnProperty.call(fileComponents, alias)) {
                if (alias === componentAlias) {
                    component = fileComponents[alias];
                }
            }
        }

        if (!component) {
            return;
        }

        return component.properties.map(
            property => CompletionItem.fromComponentProperty(property, ' = ')
        );
    }
}
