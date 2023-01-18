import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const CONTENT_TAG = /\{\%\s*content\s+[\'\"][\w\-\_\/\.]+[\'\"]/g;
const CONTENT_FUNC = /((\{\{)|=)\s*content\s*\([\'\"][\w\-\_\/\.]+[\'\"]/g;

const FILE_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

/**
 * Find definition and references for content
 */
export class ContentReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const content = this.getContent(document, position);
        if (!content) {
            return;
        }

        const locations: vscode.Location[] = await content.findReferences();

        if (context.includeDeclaration) {
            locations.push(new vscode.Location(
                vscode.Uri.file(content.path),
                new vscode.Position(0, 0)
            ));
        }

        return locations;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        const content = this.getContent(document, position);
        if (!content) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(content.path),
            new vscode.Position(0, 0)
        );
    }

    private getContent(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const mayBeContent = document.getWordRangeAtPosition(position, CONTENT_TAG)
            || document.getWordRangeAtPosition(position, CONTENT_FUNC);

        if (!mayBeContent) {
            return;
        }

        const nameRange = document.getWordRangeAtPosition(position, FILE_NAME);
        if (!nameRange) {
            return;
        }

        const fileName = document.lineAt(nameRange.start.line).text.slice(nameRange.start.character + 1, nameRange.end.character - 1);

        return themeFile.owner.contents.find(file => file.name === fileName);
    }
}
