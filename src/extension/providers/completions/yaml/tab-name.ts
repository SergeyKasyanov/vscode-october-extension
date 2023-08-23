import * as vscode from "vscode";
import * as yaml from 'yaml';
import { awaitsCompletions } from "../../../helpers/completions";

const TAB_KEY = /\s*tab:\s*/g;
const TAB_NAME_PART = /^\w*$/;

/**
 * Completions for tab names in columns and fields configs
 *
 * my_feld:
 *     label: my field
 *     tab: ...
 */
export class TabName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            TAB_KEY,
            TAB_NAME_PART
        )) {
            return;
        }

        const tabs: string[] = [];

        const config = yaml.parse(document.getText());
        const tabbedFields = config?.tabs?.fields;
        const secondaryTabbedFields = config?.secondaryTabs?.fields;

        for (const key in tabbedFields) {
            if (Object.prototype.hasOwnProperty.call(tabbedFields, key)) {
                const field = tabbedFields[key];
                if (typeof field.tab === 'string' && field.tab.length > 0) {
                    tabs.push(field.tab);
                }
            }
        }

        for (const key in secondaryTabbedFields) {
            if (Object.prototype.hasOwnProperty.call(secondaryTabbedFields, key)) {
                const field = secondaryTabbedFields[key];
                if (typeof field.tab === 'string' && field.tab.length > 0) {
                    tabs.push(field.tab);
                }
            }
        }

        return [...new Set(tabs)].map(tab => new vscode.CompletionItem(tab, vscode.CompletionItemKind.Value));
    }
}
