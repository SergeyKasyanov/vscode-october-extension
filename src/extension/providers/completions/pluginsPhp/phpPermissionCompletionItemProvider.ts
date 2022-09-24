import * as vscode from "vscode";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { pluginsPath } from "../../../../helpers/paths";
import { regExps } from "../../../../helpers/regExps";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";

/**
 * Completions for permission codes.
 *
 * $user->hasAccess(...)
 * $user->hasAccess([...])
 *
 * $user->hasAnyAccess(...)
 * $user->hasAnyAccess([...])
 *
 * $user->hasPermission(...)
 * $user->hasPermission([...])
 */
export class PhpPermissionCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        if (!document.fileName.startsWith(pluginsPath())) {
            return [];
        }

        let result = [];

        if (this.isPositionInsideRequiredPermissions() || this.isPositionInsideCheckPermissionsMethod()) {
            let permissions = Project.instance.getPermissions();

            for (const code in permissions) {
                if (Object.prototype.hasOwnProperty.call(permissions, code)) {
                    const perm = permissions[code];

                    const item = CompletionItemFactory.fromPermission(perm);
                    item.range = document.getWordRangeAtPosition(position, regExps.permissionsListEntry);

                    result.push(item);
                }
            }

            return result;
        }

        return [];
    }

    private isPositionInsideRequiredPermissions(): boolean {
        const isBackendController = !!(/namespace\s+\w+\\\w+\\Controllers\;/.exec(this.document!.getText()));

        return isBackendController && isRightAfter(
            this.document!,
            this.position!,
            regExps.requiredPermissionsPropertyGlobal,
            regExps.permissionsList
        );
    }

    private isPositionInsideCheckPermissionsMethod(): boolean | undefined {
        return isRightAfter(
            this.document!,
            this.position!,
            regExps.checkAccessMethodsGlobal,
            regExps.permissionsList
        );
    }
}
