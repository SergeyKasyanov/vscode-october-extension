import * as vscode from "vscode";
import { octoberTplSelector, phpSelector, yamlSelector } from "../helpers/file-selectors";
import { Asset } from "../providers/links/asset";
import { BackendUrl } from "../providers/links/backend-url";
import { BehaviorConfig } from "../providers/links/behavior-config";
import { CommandCode } from "../providers/links/command-code";
import { IniComponent } from "../providers/links/ini-component";
import { MakePartialPath } from "../providers/links/make-partial-path";
import { Migrations } from "../providers/links/migrations";
import { PathHelpers } from "../providers/links/path-helpers";
import { RecordUrl } from "../providers/links/record-url";
import { RelationName } from "../providers/links/relation-name";
import { TwigComponent } from "../providers/links/twig-component";
import { ViewTemplate } from "../providers/links/view-template";
import { YamlFiles } from "../providers/links/yaml-files";

export function registerDocumentLinks(context: vscode.ExtensionContext) {
    ini(context);
    php(context);
    twig(context);
    yaml(context);
}

function ini(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new IniComponent);
}

function php(context: vscode.ExtensionContext) {
    register(context, phpSelector, new BehaviorConfig);
    register(context, phpSelector, new MakePartialPath);
    register(context, phpSelector, new Asset);
    register(context, phpSelector, new RelationName);
    register(context, phpSelector, new CommandCode);

    register(context, [phpSelector, octoberTplSelector], new PathHelpers);
    register(context, [phpSelector, octoberTplSelector], new BackendUrl);
    register(context, [phpSelector, octoberTplSelector], new ViewTemplate);
}

function twig(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new TwigComponent);
}

function yaml(context: vscode.ExtensionContext) {
    register(context, yamlSelector, new YamlFiles);
    register(context, yamlSelector, new Migrations);
    register(context, yamlSelector, new RecordUrl);
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
