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
import { awaitsCompletions } from "../../../helpers/awaits-completions";

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

        const properties = controller.phpClassProperties;
        const relationConfig = properties?.relationConfig;
        if (!relationConfig || relationConfig.value?.kind !== 'string') {
            return;
        }

        let configPath = (relationConfig.value as phpParser.String).value;
        if (configPath.length === 0) {
            return;
        }

        if (configPath.startsWith('~')) {
            // ex: ~/plugins/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);
            configPath = PathHelpers.rootPath(controller.owner.project.path, configPath);
        } else if (configPath.startsWith('$')) {
            // ex: $/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);

            if (controller.owner instanceof Plugin) {
                configPath = PathHelpers.pluginsPath(controller.owner.project.path, configPath);
            } else if (controller.owner instanceof AppDirectory) {
                configPath = PathHelpers.appPath(controller.owner.project.path, configPath);
            } else if (controller.owner instanceof Module) {
                configPath = PathHelpers.modulesPath(controller.owner.project.path, configPath);
            }
        } else {
            // ex: config/relation.yaml

            configPath = configPath.split('/').join(path.sep);
            configPath = path.join(owner.path, 'controllers', controller.uqn.toLowerCase(), configPath);
        }

        if (!FsHelpers.exists(configPath)) {
            return;
        }

        const configContent = FsHelpers.readFile(configPath);

        const behaviorConfig = yaml.parse(configContent);

        return Object.keys(behaviorConfig).map(def =>
            new vscode.CompletionItem(def, vscode.CompletionItemKind.EnumMember)
        );
    }
}
