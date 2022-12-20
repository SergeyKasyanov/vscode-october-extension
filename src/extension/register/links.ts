import * as vscode from "vscode";
import { octoberTplSelector, yamlSelector, phpSelector } from "../helpers/file-selectors";
import { IniComponent } from "../providers/links/ini-component";
import { BehaviorConfig } from "../providers/links/behavior-config";
import { Asset } from "../providers/links/asset";
import { MakePartialPath } from "../providers/links/make-partial-path";
import { TwigComponent } from "../providers/links/twig-component";
import { Content } from "../providers/links/content";
import { IniLayout } from "../providers/links/ini-layout";
import { Page } from "../providers/links/page";
import { Partial } from "../providers/links/partial";
import { YamlFiles } from "../providers/links/yaml-files";
import { Migrations } from "../providers/links/migrations";
import { ViewTemplate } from "../providers/links/view-template";
import { BackendUrl } from "../providers/links/backend-url";

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

    register(context, [phpSelector, octoberTplSelector], new BackendUrl);
    register(context, [phpSelector, octoberTplSelector], new ViewTemplate);
}

function twig(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new IniLayout);
    register(context, octoberTplSelector, new Page);
    register(context, octoberTplSelector, new Partial);
    register(context, octoberTplSelector, new Content);
    register(context, octoberTplSelector, new TwigComponent);
}

function yaml(context: vscode.ExtensionContext) {
    register(context, yamlSelector, new YamlFiles);
    register(context, yamlSelector, new Migrations);
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
