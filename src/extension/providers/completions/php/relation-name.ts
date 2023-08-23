import path = require("path");
import yaml = require("yaml");
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { AppDirectory } from "../../../../domain/entities/owners/app-directory";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Module } from "../../../../domain/entities/owners/module";
import { Plugin } from "../../../../domain/entities/owners/plugin";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../../domain/helpers/path-helpers";
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
