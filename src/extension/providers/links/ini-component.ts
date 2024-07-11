import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

/**
 * Document links for component attachments in ini section of theme files
 */
export class IniComponent implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const components = themeFile.components;

        let links: vscode.DocumentLink[] = [];

        let line = 0;

        while (line < document.lineCount) {
            const lineText = document.lineAt(line).text;

            if (lineText === '==') {
                break;
            }

            if (!lineText.trim().startsWith('[')) {
                line++;
                continue;
            }

            const start = lineText.indexOf('[') + 1;
            const end = lineText.indexOf(']');
            const alias = lineText.slice(start, end).split(/\s+/).reverse()[0];

            const component = components[alias];
            if (component === undefined) {
                line++;
                continue;
            }

            const range = new vscode.Range(
                new vscode.Position(line, start),
                new vscode.Position(line, end)
            );

            const url = vscode.Uri.file(component.path)
                .with({ fragment: component.classPositionForLinks });

            links.push(new vscode.DocumentLink(range, url));

            line++;
        }

        return links;
    }
}
