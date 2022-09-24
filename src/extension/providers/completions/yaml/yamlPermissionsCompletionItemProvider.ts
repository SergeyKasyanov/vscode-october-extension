import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class YamlPermissionsCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const awaitsPermissionsCompletions = isRightAfter(document, position, regExps.yamlPermissionsTagGlobal, regExps.yamlPermissionsValue)
            || isRightAfter(document, position, regExps.yamlFormControllerModelPermissionsGlobal, regExps.yamlPermissionsValue);

        if (!awaitsPermissionsCompletions) {
            return;
        }

        let result: vscode.CompletionItem[] = [];

        let permissions = Project.instance.getPermissions();
        for (const code in permissions) {
            if (Object.prototype.hasOwnProperty.call(permissions, code)) {
                const perm = permissions[code];

                result.push(CompletionItemFactory.fromPermission(perm));
            }
        }

        return result;
    }
}
