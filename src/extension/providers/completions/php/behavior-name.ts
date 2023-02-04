import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { Model } from "../../../../domain/entities/classes/model";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const GET_CLASS_EXTENSION_METHOD = /\-\>getClassExtension\(\s*[\'\"]/g;
const BEHAVIOR_FULL_NAME_PART = /^[\w\.]*$/;
const BEHAVIOR_FULL_NAME = /[\w\.]+/;

const AS_EXTENSION_METHOD = /\-\>asExtension\(\s*[\'\"]/g;
const BEHAVIOR_NAME_PART = /^\w*$/;
const BEHAVIOR_NAME = /\w+/;

/**
 * Completions for
 *     $this->asExtension('FormController')
 *     $this->getClassExtension('Backend.Behaviors.FormController')
 */
export class BehaviorName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName) as Controller | Model;
        if (!(entity instanceof Controller || entity instanceof Model)) {
            return;
        }

        const behaviors = entity.behaviors;
        if (Object.keys(behaviors).length === 0) {
            return;
        }

        const content = document.getText();
        const offset = document.offsetAt(position);

        const asExtension = awaitsCompletions(content, offset, AS_EXTENSION_METHOD, BEHAVIOR_FULL_NAME_PART);
        if (asExtension) {
            return Object.keys(behaviors).map(fqn => {
                const uqn = fqn.split('\\').reverse()[0];
                const item = new vscode.CompletionItem(uqn, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, BEHAVIOR_NAME);

                return item;
            });
        }

        const getClassExtension = awaitsCompletions(content, offset, GET_CLASS_EXTENSION_METHOD, BEHAVIOR_NAME_PART);
        if (getClassExtension) {
            return Object.keys(behaviors).map(fqn => {
                const name = fqn.split('\\').join('.');
                const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, BEHAVIOR_FULL_NAME);

                return item;
            });
        }
    }
}
