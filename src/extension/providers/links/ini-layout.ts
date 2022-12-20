import * as vscode from "vscode";
import { Page } from "../../../domain/entities/theme/page";
import { Store } from "../../../domain/services/store";

/**
 * Document links for layout name in page files
 */
export class IniLayout implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const page = Store.instance.findEntity(document.fileName) as Page;
        if (!(page instanceof Page)) {
            return;
        }

        const pageLayout = page.layout;
        if (!pageLayout) {
            return;
        }

        let line = 0;

        while (line < document.lineCount) {
            const lineText = document.lineAt(line).text;

            if (lineText.startsWith('layout')) {
                const layoutName = lineText.split(/\s*=\s*/)[1].replace(/[\'\"]/g, '').trim();
                if (layoutName !== pageLayout.name) {
                    line++;
                    return;
                }

                const start = new vscode.Position(line, lineText.indexOf(layoutName));
                const end = start.translate(0, layoutName.length);
                const range = new vscode.Range(start, end);

                return [new vscode.DocumentLink(range, vscode.Uri.file(pageLayout.path))];
            }

            if (lineText === '==' || lineText.startsWith('[')) {
                break;
            }

            line++;
        }
    }
}
