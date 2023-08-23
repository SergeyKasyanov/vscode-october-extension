import * as vscode from "vscode";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/completions";

const PERMISSION_KEY = /permission(s{0,1}):/g;
const PERMISSION_VALUE_PART = /(^\s+[\w\.\-\_\:]*$)|(^\s+\-\s+([\w\-\_\.]+\s+\-\s+[\w\-\_\.]*)*$)/;
const PERMISSION_VALUE = /[\w\.\-\_\:]+/;

const FORM_PERMISSION_KEY = /model(Create|Update|Delete|Preview):/g;

/**
 * Completions for permissions in yaml configs
 *
 * - For fields.yaml
 *     surname:
 *         label: Surname
 *         permissions: ...
 *
 * - For config_form.yaml
 *     permissions:
 *          modelCreate: ...
 *          modelUpdate: ...
 *          modelDelete: ...
 *          modelPreview: ...
 */
export class Permission implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            [PERMISSION_KEY, FORM_PERMISSION_KEY],
            PERMISSION_VALUE_PART
        )) {
            return;
        }

        return project.permissions.map(perm => {
            const item = CompletionItem.fromPermission(perm);
            item.range = document.getWordRangeAtPosition(position, PERMISSION_VALUE);

            return item;
        });
    }
}
