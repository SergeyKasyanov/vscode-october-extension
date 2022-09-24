import * as vscode from "vscode";
import { themesPath } from "../../../helpers/paths";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";

export class TwigPageDocumentLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        let links: vscode.DocumentLink[] = [];

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const filteredPagesMatches = document.getText().matchAll(regExps.pageFilteredStringGlobal);
        for (const match of filteredPagesMatches) {
            if (!match.index) {
                continue;
            }

            const pageName = match[0].match(regExps.pageName)![0].slice(1, -1);
            const page = thisFile.theme.getPage(pageName);
            if (!page) {
                continue;
            }

            const pageNameOffset = match[0].indexOf(pageName);

            const startPos = document.positionAt(match.index + pageNameOffset);
            const endPos = startPos.translate(0, pageName.length);

            links.push(
                new vscode.DocumentLink(
                    new vscode.Range(startPos, endPos),
                    vscode.Uri.file(themesPath(page.filepath))
                )
            );
        }

        return links;
    }
}
