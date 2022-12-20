import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { Hover } from "../../factories/hover-factory";

const PAGE_URL_METHOD = /->\s*pageUrl\s*\(\s*[\'\"][\w\-\_\/]+[\'\"]/;
const PAGE_FILTERED_STRING = /[\'\"][\w\-\_\/]+[\'\"]\s*\|\s*page/;
const PAGE_NAME = /[\'\"][\w\-\_\/]+[\'\"]/;

/**
 * Hover info for page
 *
 * $this->pageUrl('')
 *
 * {{ 'blog/post' | page }}
 */
export class Page implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        let wordRange: vscode.Range | undefined;

        const offset = document.offsetAt(position);
        if (themeFile.isOffsetInsidePhp(offset)) {
            wordRange = document.getWordRangeAtPosition(position, PAGE_URL_METHOD);
        } else if (themeFile.isOffsetInsideTwig(offset)) {
            wordRange = document.getWordRangeAtPosition(position, PAGE_FILTERED_STRING);
        }

        if (!wordRange) {
            return;
        }

        const quotedPageName = document.lineAt(position.line).text
            .slice(wordRange.start.character, wordRange.end.character)
            .match(PAGE_NAME);
        if (!quotedPageName) {
            return;
        }

        const pageName = quotedPageName[0].slice(1, -1);
        if (!pageName) {
            return;
        }

        const page = themeFile.owner.pages.find(p => pageName === p.name);
        if (!page) {
            return;
        }

        return Hover.fromThemeFile(page);
    }
}
