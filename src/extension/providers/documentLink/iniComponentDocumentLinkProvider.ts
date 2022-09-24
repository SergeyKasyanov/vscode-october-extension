import * as vscode from "vscode";
import { Project } from "../../../services/project";

export class IniComponentDocumentLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

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
            const componentName = lineText.slice(start, end).split(/\s+/)[0];

            const component = Project.instance.getComponent(componentName);

            if (component === undefined) {
                line++;
                continue;
            }

            links.push(
                new vscode.DocumentLink(
                    new vscode.Range(new vscode.Position(line, start), new vscode.Position(line, start + componentName.length)),
                    vscode.Uri.file(component.filepath)
                )
            );

            line++;
        }

        return links;
    }
}
