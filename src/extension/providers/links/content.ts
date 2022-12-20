import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const CONTENT_TAG = /\{\%\s*content\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const CONTENT_FUNC = /((\{\{)|=)\s*content\s*\([\'\"][\w\-\_\/\.]+[\'\"]/g;
const CONTENT_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

/**
 * Document links for content
 *
 * {% content '...' %}
 * {{ content('...') }}
 * {% set contentAsString = content('...') %}
 */
export class Content implements vscode.DocumentLinkProvider {

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
            ...this.processMatches(document.getText().matchAll(CONTENT_TAG)),
            ...this.processMatches(document.getText().matchAll(CONTENT_FUNC))
        ];
    }

    private processMatches(contentsMatches: IterableIterator<RegExpMatchArray>): vscode.DocumentLink[] {
        const links = [];

        for (const match of contentsMatches) {
            const contentNameMatch = match[0].match(CONTENT_NAME)!;

            let contentName = contentNameMatch[0].slice(1, -1);

            const nameLength = contentName.length;

            if (!contentName.includes('.')) {
                contentName += '.htm';
            }

            const content = this.themeFile!.owner.contents.find(c => c.name === contentName);
            if (!content) {
                continue;
            }

            const start = this.document!.positionAt(match.index! + contentNameMatch.index! + 1);
            const end = start.translate(0, nameLength);
            const range = new vscode.Range(start, end);

            links.push(new vscode.DocumentLink(range, vscode.Uri.file(content.path)));
        }

        return links;
    }
}
