import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { Hover } from "../../factories/hover-factory";

const PARTIAL_TAG = /partial\s+[\'\"][\w\-\_\/]+[\'\"]/;
const PARTIAL_FUNC = /partial\s*\(\s*[\'\"][\w\-\_\/]+[\'\"]/;
const PARTIAL_NAME = /[\'\"][\w\-\_\/]+[\'\"]/;

/**
 * Hover info for partial
 *
 * {% partial 'blog/post' %}
 * {% set content = partial('blog/post') %}
 */
export class Partial implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, PARTIAL_TAG)
            || document.getWordRangeAtPosition(position, PARTIAL_FUNC);
        if (!wordRange) {
            return;
        }

        const partialName = document.lineAt(position.line).text
            .match(PARTIAL_NAME)![0]
            .slice(1, -1);

        const partial = themeFile.owner.partials.find(p => p.name === partialName);
        if (!partial) {
            return;
        }

        return Hover.fromThemeFile(partial);
    }
}
