import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const PARTIAL_TAG = /\{\%\s*partial\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PARTIAL_FUNC = /((\{\{)|=)\s*partial\s*\(\s*[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PARTIAL_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

/**
 * Document links for partials
 *
 * {% partial 'blog/post' %}
 * {% set content = partial('blog/post') %}
 */
export class Partial implements vscode.DocumentLinkProvider {

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
            ...this.processMatches(document.getText().matchAll(PARTIAL_TAG)),
            ...this.processMatches(document.getText().matchAll(PARTIAL_FUNC))
        ];
    }

    private processMatches(partialsMatches: IterableIterator<RegExpMatchArray>): vscode.DocumentLink[] {
        const links = [];

        for (const match of partialsMatches) {
            const partialNameMatch = match[0].match(PARTIAL_NAME)!;
            const partialName = partialNameMatch[0].slice(1, -1);

            const partial = this.themeFile!.owner.partials.find(p => p.name === partialName);
            if (!partial) {
                continue;
            }

            const start = this.document!.positionAt(match.index! + partialNameMatch.index! + 1);
            const end = start.translate(0, partialName.length);
            const range = new vscode.Range(start, end);

            links.push(new vscode.DocumentLink(range, vscode.Uri.file(partial.path)));
        }

        return links;
    }
}
