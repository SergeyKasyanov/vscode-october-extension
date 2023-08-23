import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const AJAX_REQUEST = /((data\-request=)|(\$\.request\s*\(\s*)|(oc\s*\.ajax\s*\(\s*)|(oc\.request\s*\(\s*[\'\"].*[\'\"]\s*,\s*)|(ajaxHandler\s*\(\s*)|(request:\s*)|(form_ajax\s*\(\s*))[\'\"]/g;
const AJAX_REQUEST_NAME = /^[\w\:]*$/;
const AJAX_REQUEST_NAME_WORD = /[\w\:]+/;

/**
 * Completions for ajax methods.
 *
 * <button data-request="..."></button>
 * $.request('...')
 * oc.ajax('...')
 * oc.request('form', '...')
 * {{ do ajaxHandler('...') }}
 * {{ form_open({ request: '...' }) }}
 * {{ form_ajax('...') }}
 */
export class AjaxMethod implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            AJAX_REQUEST,
            AJAX_REQUEST_NAME
        )) {
            return;
        }

        return this.ajaxMethods(themeFile).map(meth => {
            const item = new vscode.CompletionItem(meth, vscode.CompletionItemKind.Method);
            item.range = document.getWordRangeAtPosition(position, AJAX_REQUEST_NAME_WORD);

            return item;
        });
    }

    /**
     * Ajax methods from this file, layout of this file and all components
     *
     * @param themeFile
     * @returns
     */
    private ajaxMethods(themeFile: MarkupFile): string[] {
        const ajaxMethods = themeFile.ajaxMethods;

        const components = themeFile.components;
        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const component = components[alias];
                for (const meth of component.ajaxMethods) {
                    ajaxMethods.push(alias + '::' + meth);
                }
            }
        }

        if (themeFile instanceof Page && themeFile.layout) {
            ajaxMethods.push(...themeFile.layout.ajaxMethods);

            const layoutComponents = themeFile.layout.components;
            for (const alias in layoutComponents) {
                if (Object.prototype.hasOwnProperty.call(layoutComponents, alias)) {
                    const component = layoutComponents[alias];
                    for (const meth of component.ajaxMethods) {
                        ajaxMethods.push(alias + '::' + meth);
                    }
                }
            }
        }

        return ajaxMethods;
    }
}
