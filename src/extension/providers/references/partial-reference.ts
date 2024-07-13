import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const PARTIAL_TAG = /\{\%\s*(ajaxPartial|partial)\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
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

        const locations: vscode.Location[] = await partial.findReferences();

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
