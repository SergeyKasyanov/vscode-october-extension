import * as vscode from "vscode";
import * as yaml from 'yaml';
import { Controller } from "../../../../domain/entities/classes/controller";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const RELATION_RENDER = /->relationRender\s*\(\s*[\'\"]/g;
const RELATION_NAME_PART = /^\w*$/;

/**
 * Completions for relation name in relationRender() method
 *
 * $this->relationRender('...')
 */
export class RelationName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const controller = owner.findEntityByPath(document.fileName)
            || owner.findEntityByRelatedName(document.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const relationController = Object.values(controller.behaviors)
            .map(b => b.behavior)
            .find(beh => beh.fqn === 'Backend\\Behaviors\\RelationController');
        if (!relationController) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            RELATION_RENDER,
            RELATION_NAME_PART
        )) {
            return;
        }

        const configs = controller.getBehaviorConfigPaths('Backend\\Behaviors\\RelationController');
        if (!configs || !configs.default || !FsHelpers.exists(configs.default)) {
            return;
        }

        const configContent = FsHelpers.readFile(configs.default);

        const behaviorConfig = yaml.parse(configContent);

        return Object.keys(behaviorConfig).map(def =>
            new vscode.CompletionItem(def, vscode.CompletionItemKind.EnumMember)
        );
    }
}
