import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const PAGE_URL = /->\s*pageUrl\s*\(\s*[\'\"][\w\_\-\/\.]+[\'\"]/g;
const PAGE_STR = /[\'\"][\w\_\-\/\.]+[\'\"]\s*\|\s*page/g;
const PAGE_NAME = /[\'\"][\w\_\-\/\.]+[\'\"]/g;

/**
 * Document links for pages
 *
 * $this->pageUrl('blog/post')
 * {{ 'blog/post'|page }}
 */
export class Page implements vscode.DocumentLinkProvider {

    private document?: vscode.TextDocument;
    private themeFile?: MarkupFile;

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.document = document;

        this.themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(this.themeFile instanceof MarkupFile)) {
            return;
        }

        return [
            ...this.processMatches(document.getText().matchAll(PAGE_URL)),
            ...this.processMatches(document.getText().matchAll(PAGE_STR))
        ];
    }

    private processMatches(pagesMatches: IterableIterator<RegExpMatchArray>) {
        const links = [];

        for (const match of pagesMatches) {
            const pageNameMatch = [...match[0].matchAll(PAGE_NAME)].reverse()[0];
            const pageName = pageNameMatch[0].slice(1, -1);

            const page = this.themeFile!.owner.pages.find(p => p.name === pageName);
            if (!page) {
                continue;
            }

            const start = this.document!.positionAt(match.index! + pageNameMatch.index! + 1);
            const end = start.translate(0, pageName.length);
            const range = new vscode.Range(start, end);

            links.push(new vscode.DocumentLink(range, vscode.Uri.file(page.path)));
        }

        return links;
    }
}
