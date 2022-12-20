import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const CONTENT_TAG = /\{\%\s*content\s+[\'\"][\w\/\-.]+[\'\"]\s*/g;
const CONTENT_TAG_ARGS = /^(\s*\w+\s*=\s*([\'\"]{0,1}[а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]*[\'\"]{0,1}))*$/;
const CONTENT_FUNC = /=\s*content\s*\([\'\"][\w\/\-.]+[\'\"]\s*,\s*\{\s*/g;
const CONTENT_FUNC_OBJ_KEYS = /^\s*(\w+\:.*,\s*)*$/;
const CONTENT_NAME = /[\'\"][\w\/\-.]+[\'\"]/;

/**
 * Completions for content names in twig content tag.
 *
 * {% content '...' %}
 */
export class ContentArguments implements vscode.CompletionItemProvider {

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
        let contentName: string | undefined;

        let matchStart = awaitsCompletions(fileContent, offset, CONTENT_FUNC, CONTENT_FUNC_OBJ_KEYS);
        if (matchStart) {
            mode = 'var';
            contentName = document.getText().slice(matchStart, offset).match(CONTENT_NAME)![0].slice(1, -1);
        }

        if (!contentName) {
            matchStart = awaitsCompletions(fileContent, offset, CONTENT_TAG, CONTENT_TAG_ARGS);
            if (matchStart) {
                contentName = document.getText().slice(matchStart, offset).match(CONTENT_NAME)![0].slice(1, -1);
                mode = 'tag';
            }
        }

        if (!contentName) {
            return;
        }

        const content = themeFile.owner.contents.find(c => c.name === contentName);
        if (!content) {
            return;
        }

        const contentVars = content.usedVars;
        if (contentVars.length === 0) {
            return;
        }

        const components = Object.keys(themeFile.components);
        if (themeFile instanceof Page && themeFile.layout) {
            components.push(...Object.keys(themeFile.layout.components));
        }

        return contentVars
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
