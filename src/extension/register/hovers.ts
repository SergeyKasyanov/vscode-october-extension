import * as vscode from "vscode";
import { octoberTplSelector } from "../helpers/file-selectors";
import { ComponentName } from "../providers/hovers/component-name";
import { ComponentProperty } from "../providers/hovers/component-property";
import { Layout } from "../providers/hovers/layout";
import { IniProperty } from "../providers/hovers/ini-property";
import { TwigFunction } from "../providers/hovers/twig-function";
import { TwigFilter } from "../providers/hovers/twig-filter";
import { Page } from "../providers/hovers/page";
import { Partial } from "../providers/hovers/partial";
import { TwigTag } from "../providers/hovers/twig-tag";

export function registerHovers(context: vscode.ExtensionContext) {
    ini(context);
    twig(context);
}

function twig(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new Page);
    register(context, octoberTplSelector, new Partial);
    register(context, octoberTplSelector, new TwigTag);
    register(context, octoberTplSelector, new TwigFunction);
    register(context, octoberTplSelector, new TwigFilter);
}

function ini(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new IniProperty);
    register(context, octoberTplSelector, new ComponentName);
    register(context, octoberTplSelector, new ComponentProperty);
    register(context, octoberTplSelector, new Layout);
}

function register(
    context: vscode.ExtensionContext,
    selector: vscode.DocumentSelector,
    provider: vscode.HoverProvider
) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            selector,
            provider
        )
    );
}
