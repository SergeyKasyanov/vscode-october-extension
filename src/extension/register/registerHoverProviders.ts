import * as vscode from "vscode";
import { octoberTplSelector } from "../../helpers/fileSelectors";
import { IniComponentHoverProvider } from "../providers/hovers/iniComponentHoverProvider";
import { IniComponentPropertyHoverProvider } from "../providers/hovers/iniComponentPropertyHoverProvider";
import { IniLayoutHoverProvider } from "../providers/hovers/iniLayoutHoverProvider";
import { IniPropertyHoverProvider } from "../providers/hovers/iniPropertyHoverProvider";
import { TwigEchoHoverProvider } from "../providers/hovers/twigEchoHoverProvider";
import { TwigFilterHoverProvider } from "../providers/hovers/twigFilterHoverProvider";
import { TwigPageHoverProvider } from "../providers/hovers/twigPageHoverProvider";
import { TwigPartialHoverProvider } from "../providers/hovers/twigPartialHoverProvider";
import { TwigTagHoverProvider } from "../providers/hovers/twigTagHoverProvider";

export function registerHoverProviders(context: vscode.ExtensionContext) {
    themeIni(context);
    themeTwig(context);
}

function themeTwig(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new TwigPageHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new TwigPartialHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new TwigTagHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new TwigEchoHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new TwigFilterHoverProvider));
}

function themeIni(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new IniPropertyHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new IniComponentHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new IniComponentPropertyHoverProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(octoberTplSelector, new IniLayoutHoverProvider));
}
