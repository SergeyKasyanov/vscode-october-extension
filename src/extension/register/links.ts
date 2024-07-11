import * as vscode from "vscode";
import { octoberTplSelector, phpSelector, yamlSelector } from "../helpers/file-selectors";
import { Asset } from "../providers/links/asset";
import { BackendUrl } from "../providers/links/backend-url";
import { BehaviorConfig } from "../providers/links/behavior-config";
import { CommandCode } from "../providers/links/command-code";
import { ControllerAction } from "../providers/links/controller-action";
import { ListName } from "../providers/links/list-name";
import { MakePartialPath } from "../providers/links/make-partial-path";
import { Migrations } from "../providers/links/migrations";
import { PathHelpers } from "../providers/links/path-helpers";
import { RecordUrl } from "../providers/links/record-url";
import { RelationName } from "../providers/links/relation-name";
import { ViewTemplate } from "../providers/links/view-template";
import { YamlFiles } from "../providers/links/yaml-files";
import { CustomRelationToolbarButton } from "../providers/links/custom-relation-toolbar-button";
import { SettingsFields } from "../providers/links/settings-fields";

export function registerDocumentLinks(context: vscode.ExtensionContext) {
    php(context);
    yaml(context);
}

function php(context: vscode.ExtensionContext) {
    register(context, phpSelector, new BehaviorConfig);
    register(context, phpSelector, new MakePartialPath);
    register(context, phpSelector, new Asset);
    register(context, phpSelector, new ListName);
    register(context, phpSelector, new RelationName);
    register(context, phpSelector, new CommandCode);
    register(context, phpSelector, new SettingsFields);

    register(context, [phpSelector, octoberTplSelector], new PathHelpers);
    register(context, [phpSelector, octoberTplSelector], new BackendUrl);
    register(context, [phpSelector, octoberTplSelector], new ControllerAction);
    register(context, [phpSelector, octoberTplSelector], new ViewTemplate);
}

function yaml(context: vscode.ExtensionContext) {
    register(context, yamlSelector, new YamlFiles);
    register(context, yamlSelector, new Migrations);
    register(context, yamlSelector, new RecordUrl);
    register(context, yamlSelector, new CustomRelationToolbarButton);
}

function register(
    context: vscode.ExtensionContext,
    selector: vscode.DocumentSelector,
    provider: vscode.DocumentLinkProvider
) {
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            selector,
            provider
        )
    );
}
