import { existsSync, fstat } from "fs";
import path = require("path");
import { CancellationToken, DocumentLink, DocumentLinkProvider, Position, ProviderResult, Range, TextDocument, Uri } from "vscode";

export class YamlMigrationDocumentLinkProvider implements DocumentLinkProvider {
    provideDocumentLinks(document: TextDocument, token: CancellationToken): ProviderResult<DocumentLink[]> {
        if (!document.fileName.endsWith(path.sep + 'updates' + path.sep + 'version.yaml')) {
            return;
        }

        let links = [];

        const directory = document.fileName.slice(0, -1 * ('version.yaml'.length));

        let line = 0;
        while (line < document.lineCount) {
            const lineText = document.lineAt(line).text;
            const trimmed = lineText.trim();
            if (trimmed.startsWith('-') && trimmed.endsWith('.php')) {
                const filename = trimmed.slice(1).trim();
                const migrationPath = path.join(directory, filename);
                if (existsSync(migrationPath)) {
                    links.push(new DocumentLink(
                        new Range(
                            new Position(line, lineText.indexOf(filename)),
                            new Position(line, lineText.indexOf(filename) + filename.length)
                        ),
                        Uri.file(migrationPath)
                    ));
                }
            }

            line++;
        }

        return links;
    }
}
