import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Themes } from "../../../../services/themes";
import { Component } from "../../../../types/plugin/component";
import { Layout } from "../../../../types/theme/layout";
import { Page } from "../../../../types/theme/page";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for ajax methods.
 *
 * <button data-request="..."></button>
 * $.request('...')
 * {{ do ajaxHandler('...') }}
 */
export class TwigAjaxMethodCompletionItemProvider implements vscode.CompletionItemProvider {

    private thisFile: Layout | Page | undefined;

    private ajaxMethods: string[] = [];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!thisFile || !(thisFile instanceof Layout || thisFile instanceof Page)) {
            return;
        }

        this.thisFile = thisFile;

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        if (!isRightAfter(document, position, regExps.ajaxRequestGlobal, regExps.ajaxRequestName)) {
            return;
        }

        this.loadAjaxMethods();

        return this.ajaxMethods.map(meth => {
            const item = new vscode.CompletionItem(meth, vscode.CompletionItemKind.Method);
            item.range = document.getWordRangeAtPosition(position, regExps.ajaxRequestNameWord);

            return item;
        });
    }

    private loadAjaxMethods() {
        this.ajaxMethods = [];

        let components: { [alias: string]: Component } = {};

        if (this.thisFile instanceof Page && this.thisFile.layoutName) {
            const layout = this.thisFile.theme.getLayout(this.thisFile.layoutName);

            if (layout) {
                this.ajaxMethods.push(...layout.ajaxMethods);

                components = ThemeFileUtils.getComponents(layout);
            }
        }

        this.ajaxMethods.push(...this.thisFile!.ajaxMethods);

        const pageComponents = ThemeFileUtils.getComponents(this.thisFile!);

        for (const alias in pageComponents) {
            if (Object.prototype.hasOwnProperty.call(pageComponents, alias)) {
                const comp = pageComponents[alias];
                components[alias] = comp;
            }
        }

        this.addComponentsAjaxMethods(components);
    }

    private addComponentsAjaxMethods(components: { [alias: string]: Component; }) {
        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const comp = components[alias];

                for (const meth of comp.data.ajaxMethods) {
                    this.ajaxMethods.push(alias + '::' + meth);
                }
            }
        }
    }
}
