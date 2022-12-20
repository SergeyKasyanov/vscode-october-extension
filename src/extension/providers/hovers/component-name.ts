import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { Hover } from "../../factories/hover-factory";

const COMPONENT_ATTACHMENT = /\[[\w\_]+(\s+[\w\_]+){0,1}\]/;
const COMPONENT_TAG = /\{\%\s*component\s*[\'\"][\w\_]+[\'\"]/;

/**
 * Hover info for components in ini or twig section
 *
 * [blogPost]
 * {% component 'blogPost' %}
 */
export class ComponentName implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const offset = document.offsetAt(position);
        let componentAlias: string | undefined;

        if (themeFile.isOffsetInsideIni(offset)) {
            const range = document.getWordRangeAtPosition(position, COMPONENT_ATTACHMENT);
            if (range) {
                componentAlias = document
                    .lineAt(position.line)
                    .text
                    .slice(range.start.character + 1, range.end.character - 1)
                    .trim()
                    .split(/\s+/)
                    .reverse()[0];
            }
        } else if (themeFile.isOffsetInsideTwig(offset)) {
            const range = document.getWordRangeAtPosition(position, COMPONENT_TAG);
            if (range) {
                componentAlias = document
                    .lineAt(position.line)
                    .text
                    .split(/[\'\"]/)[1];
            }
        }

        if (!componentAlias) {
            return;
        }

        const component = themeFile.components[componentAlias];
        if (!component) {
            return;
        }

        return Hover.fromComponent(component);
    }
}
