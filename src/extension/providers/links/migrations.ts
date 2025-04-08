import * as vscode from "vscode";
import { Plugin } from "../../../domain/entities/owners/plugin";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { Store } from "../../../domain/services/store";
import path = require("path");

/**
 * Document links for migrations in version.yaml
 */
export class Migrations implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        if (!document.fileName.endsWith(path.join('updates', 'version.yaml'))) {
            return;
        }

        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof Plugin)) {
            return;
        }

        const links = [];

        const directory = path.join(owner.path, 'updates');
        const migrations = FsHelpers.listFiles(directory, true, ['php']);

        let line = 0;
        while (line < document.lineCount) {
            const lineText = document.lineAt(line).text;
            const trimmed = lineText.trim();

            if (trimmed.startsWith('-') && trimmed.endsWith('.php')) {
                const fileName = trimmed.slice(1).trim();
                if (!migrations.includes(fileName)) {
                    line++
                    continue;
                }

                const start = new vscode.Position(line, lineText.indexOf(fileName));
                const end = start.translate(0, fileName.length);
                const range = new vscode.Range(start, end);

                const migrationPath = path.join(owner.path, 'updates', fileName);
                const url = vscode.Uri.file(migrationPath);

                links.push(new vscode.DocumentLink(range, url));
            }

            line++;
        }

        return links;
    }
}
