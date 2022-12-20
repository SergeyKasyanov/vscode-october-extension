import * as vscode from "vscode";
import { Page } from "../../../domain/entities/theme/page";
import { Store } from "../../../domain/services/store";
import { Hover } from "../../factories/hover-factory";

const LAYOUT_PROPERTY = /^layout\s*\=\s*[\'\"]{0,1}[\w\s\_\/]+[\'\"]{0,1}\s*$/;
const LAYOUT_NAME = /[\'\"]{0,1}[\w\s\_\/]+[\'\"]{0,1}/;

/**
 * Hover info for layout name in ini section of theme files
 *
 * layout = "main"
 */
export class Layout implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const page = Store.instance.findEntity(document.fileName);
        if (!(page instanceof Page)) {
            return;
        }

        if (!page.isOffsetInsideFileConfig(document.offsetAt(position))) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, LAYOUT_NAME);
        if (!wordRange) {
            return;
        }

        const currentLineText = document.lineAt(position.line).text;
        const currentLineIsLayout = currentLineText.match(LAYOUT_PROPERTY);
        if (!currentLineIsLayout) {
            return;
        }

        const layout = page.layout;
        if (!layout) {
            return;
        }

        let hoveredWord = currentLineText.slice(wordRange.start.character, wordRange.end.character);

        if (hoveredWord.startsWith('\'') || hoveredWord.startsWith('"')) {
            hoveredWord = hoveredWord.slice(1);
        }

        if (hoveredWord.endsWith('\'') || hoveredWord.endsWith('"')) {
            hoveredWord = hoveredWord.slice(0, hoveredWord.length - 1);
        }

        if (hoveredWord !== layout.name) {
            return;
        }

        return Hover.fromThemeFile(layout);
    }
}
