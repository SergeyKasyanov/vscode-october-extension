import * as vscode from "vscode";
import { octoberTplSelector, yamlSelector, phpSelector } from "../../helpers/fileSelectors";
import { IniComponentDocumentLinkProvider } from "../providers/documentLink/iniComponentDocumentLinkProvider";
import { PhpBehaviorsConfigDocumentLinkProvider } from "../providers/documentLink/phpBehaviorsConfigDocumentLinkProvider";
import { PhpAssetDocumentLinkProvider } from "../providers/documentLink/phpAssetDocumentLinkProvider";
import { PhpMakePartialDocumentLinkProvider } from "../providers/documentLink/phpMakePartialDocumentLinkProvider";
import { PhpPageDocumentLinkProvider } from "../providers/documentLink/phpPageDocumentLinkProvider";
import { TwigComponentDocumentLinkProvider } from "../providers/documentLink/twigComponentDocumentLinkProvider";
import { TwigContentDocumentLinkProvider } from "../providers/documentLink/twigContentDocumentLinkProvider";
import { TwigLayoutDocumentLinkProvider } from "../providers/documentLink/twigLayoutDocumentLinkProvider";
import { TwigPageDocumentLinkProvider } from "../providers/documentLink/twigPageDocumentLinkProvider";
import { TwigPartialDocumentLinkProvider } from "../providers/documentLink/twigPartialDocumentLinkProvider";
import { YamlDocumentLinkProvider } from "../providers/documentLink/yamlDocumentLinkProvider";
import { YamlMigrationDocumentLinkProvider } from "../providers/documentLink/yamlMigrationDocumentLinkprovider";
import { PhpMailTemplateDocumentLinkProvider } from "../providers/documentLink/phpMailTemplateDocumentLinkProvider";

export function registerDocumentLinkProviders(context: vscode.ExtensionContext) {
    themeIni(context);
    themePhp(context);
    themeTwig(context);
    pluginsYaml(context);
    pluginsPhp(context);

    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider([phpSelector, octoberTplSelector], new PhpMailTemplateDocumentLinkProvider));
}

function pluginsPhp(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(phpSelector, new PhpBehaviorsConfigDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(phpSelector, new PhpMakePartialDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(phpSelector, new PhpAssetDocumentLinkProvider));
}

function pluginsYaml(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(yamlSelector, new YamlDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(yamlSelector, new YamlMigrationDocumentLinkProvider));
}

function themeTwig(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new TwigLayoutDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new TwigPageDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new TwigPartialDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new TwigContentDocumentLinkProvider));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new TwigComponentDocumentLinkProvider));
}

function themePhp(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new PhpPageDocumentLinkProvider));
}

function themeIni(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(octoberTplSelector, new IniComponentDocumentLinkProvider));
}
