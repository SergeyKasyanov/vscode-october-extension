import { existsSync } from "fs";
import * as vscode from "vscode";
import { relativePath } from "../../../helpers/paths";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { regExps } from "../../../helpers/regExps";

export class PhpMakePartialDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private document: vscode.TextDocument | undefined;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || !parsed.directory?.match(/controllers|\w*widgets/)) {
            return;
        }

        this.document = document;

        return this.getLinks();
    }

    private getLinks(): vscode.ProviderResult<vscode.DocumentLink[]> {
        let links: vscode.DocumentLink[] = [];

        const makePartialCalls = this.document!.getText().matchAll(regExps.phpMakePartialMethodsGlobal);
        for (const match of makePartialCalls) {
            const partialNameMatch = match[0].match(regExps.phpMakePartialMethodPartialParam);
            if (!partialNameMatch) {
                continue;
            }

            const partialName = partialNameMatch[0].slice(1, -1);
            const partialFile = relativePath(partialName, this.document!.fileName, true);
            if (!partialFile || !existsSync(partialFile)) {
                continue;
            }

            const start = this.document!.positionAt(match.index! + partialNameMatch.index! + 1);
            const end = start.translate(0, partialName.length);
            const range = new vscode.Range(start, end);

            links.push(
                new vscode.DocumentLink(range, vscode.Uri.file(partialFile))
            );
        }

        return links;
    }
}
