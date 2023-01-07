import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const PARTIAL_TAG = /\{\%\s*partial\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PARTIAL_FUNC = /((\{\{)|=)\s*partial\s*\(\s*[\'\"][\w\-\_\/\.]+[\'\"]/g;

const FILE_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

/**
 * Find definition and references for partial
 */
export class PartialReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const partial = this.getPartial(document, position);
        if (!partial) {
            return;
        }

        const locations: vscode.Location[] = [];

        for (const theme of [partial.owner, ...partial.owner.childrenThemes]) {
            const themeFiles = [
                ...theme.layouts,
                ...theme.pages,
                ...theme.partials,
            ];

            for (const file of themeFiles) {
                const offsets = file.partials[partial.name] || [];

                for (const offset of offsets) {
                    const fileDocument = file.path === document.fileName
                        ? document
                        : await vscode.workspace.openTextDocument(vscode.Uri.file(file.path));
                    const start = fileDocument.positionAt(offset.start);
                    const end = fileDocument.positionAt(offset.end);
                    const range = new vscode.Range(start, end);
                    const location = new vscode.Location(vscode.Uri.file(file.path), range);

                    locations.push(location);
                }
            }
        }

        if (context.includeDeclaration) {
            locations.push(new vscode.Location(
                vscode.Uri.file(partial.path),
                new vscode.Position(0, 0)
            ));
        }

        return locations;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        const partial = this.getPartial(document, position);
        if (!partial) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(partial.path),
            new vscode.Position(0, 0)
        );
    }

    private getPartial(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const mayBePartial = document.getWordRangeAtPosition(position, PARTIAL_TAG)
            || document.getWordRangeAtPosition(position, PARTIAL_FUNC);

        if (!mayBePartial) {
            return;
        }

        const nameRange = document.getWordRangeAtPosition(position, FILE_NAME);
        if (!nameRange) {
            return;
        }

        const partialName = document.lineAt(nameRange.start.line).text.slice(nameRange.start.character + 1, nameRange.end.character - 1);

        return themeFile.owner.partials.find(file => file.name === partialName);
    }
}
