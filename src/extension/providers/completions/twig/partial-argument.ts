import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const PARTIAL_TAG = /\{\%\s*partial\s+[\'\"][\w\/\-.]+[\'\"]\s*/g;
const PARTIAL_TAG_ARGS = /^(\s*\w+\s*=\s*([\'\"]{0,1}[а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]*[\'\"]{0,1}))*$/;
const PARTIAL_FUNC = /=\s*partial\s*\([\'\"][\w\/\-.]+[\'\"]\s*,\s*\{\s*/g;
const PARTIAL_FUNC_OBJ_KEYS = /^\s*(\w+\:.*,\s*)*$/;
const PARTIAL_NAME = /[\'\"][\w\/\-.]+[\'\"]/;

/**
 * Completions for arguments in twig partial tag
 *
 * {% partial 'partial/name' *argName* = %}
 * {% set varName = partial('partial/name', { *argName*: val, *argName*:  }) %}
 */
export class PartialArgument implements vscode.CompletionItemProvider {

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

        const fileContent = document.getText();
        const offset = document.offsetAt(position);

        let mode: 'tag' | 'var';
        let partialName: string | undefined;

        let matchStart = awaitsCompletions(fileContent, offset, PARTIAL_FUNC, PARTIAL_FUNC_OBJ_KEYS);
        if (matchStart) {
            mode = 'var';
            partialName = document.getText().slice(matchStart, offset).match(PARTIAL_NAME)![0].slice(1, -1);
        }

        if (!partialName) {
            matchStart = awaitsCompletions(fileContent, offset, PARTIAL_TAG, PARTIAL_TAG_ARGS);
            if (matchStart) {
                partialName = document.getText().slice(matchStart, offset).match(PARTIAL_NAME)![0].slice(1, -1);
                mode = 'tag';
            }
        }

        if (!partialName) {
            return;
        }

        const partial = themeFile.owner.partials.find(p => p.name === partialName);
        if (!partial) {
            return;
        }

        const partialVars = partial.usedVars;
        if (partialVars.length === 0) {
            return;
        }

        const components = Object.keys(themeFile.components);
        if (themeFile instanceof Page && themeFile.layout) {
            components.push(...Object.keys(themeFile.layout.components));
        }

        return partialVars
            .filter(variable => !components.includes(variable))
            .map(variable => {
                let item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Property);

                if (mode === 'tag') {
                    item.insertText = variable + ' = ';
                } else {
                    item.insertText = variable + ': ';
                }

                return item;
            });
    }
}
