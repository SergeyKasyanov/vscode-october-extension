import * as vscode from "vscode";
import { themesPath } from "../../../helpers/paths";
import { Themes } from "../../../services/themes";
import { Page } from "../../../types/theme/page";

export class TwigLayoutDocumentLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        let links: vscode.DocumentLink[] = [];

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof Page)) {
            return;
        }

        let line = 0;

        while (line < document.lineCount) {
            const lineText = document.lineAt(line).text;

            if (lineText.startsWith('layout')) {
                let layoutName = lineText.split(/\s*=\s*/)[1].replace(/[\'\"]/g, '').trim();
                if (!layoutName) {
                    line++;
                    continue;
                }

                const layout = thisFile.theme.getLayout(layoutName);
                if (!layout) {
                    line++;
                    continue;
                }

                let start = lineText.indexOf(layoutName);

                links.push(
                    new vscode.DocumentLink(
                        new vscode.Range(new vscode.Position(line, start), new vscode.Position(line, start + layoutName.length)),
                        vscode.Uri.file(themesPath(layout.filepath))
                    )
                );
            }

            if (lineText === '==' || lineText.startsWith('[')) {
                break;
            }

            line++;
        }

        return links;
    }
}
