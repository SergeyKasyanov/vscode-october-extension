import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { Project } from "../../../../domain/entities/project";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions, insideAssociativeArrayEntryKey, insideClassProperty } from "../../../helpers/completions";

const CHECK_METHOD = /(\:\:userHasAccess|\:\:userHasPermission|\->hasAccess|\->hasAnyAccess|\->hasPermission)\s*\(\s*(\[|(array\()){0,1}/g;
const PERMISSION_PART = /^\s*[\'\"]([\w\.\-\_\:]*[\'\"]\s*,\s*[\'\"])*[\w\.\-\_\:]*$/;
const PERMISSION_VALUE = /[\w\.\-\_\:]+/;


/**
 * Completions for permission codes in $requiredPermissions of backend controllers
 * and checking permissions methods.
 *
 * protected $requiredPermissions = [...]
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
export class Permission implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const controller = Store.instance.findEntity(document.fileName) as Controller;
        if (controller instanceof Controller) {
            const requiredPermissionsRange = insideClassProperty(controller.phpClass!, document.offsetAt(position), ['requiredPermissions']);
            if (requiredPermissionsRange && insideAssociativeArrayEntryKey(document, position, requiredPermissionsRange)) {
                return this.completions(project, document, position);
            }
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            CHECK_METHOD,
            PERMISSION_PART
        )) {
            return;
        }

        return this.completions(project, document, position);
    }

    private completions(project: Project, document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return project.permissions.map(perm => {
            const item = CompletionItem.fromPermission(perm);
            item.range = document.getWordRangeAtPosition(position, PERMISSION_VALUE);

            return item;
        });
    }
}
