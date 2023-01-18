import * as vscode from "vscode";
import { Page } from "../../../domain/entities/theme/page";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";

const PAGE_URL = /->\s*pageUrl\s*\(\s*[\'\"][\w\-\_\/\.]+[\'\"]/g;
const PAGE_STR = /[\'\"][\w\-\_\/\.]+[\'\"]\s*\|\s*page/g;

const FILE_NAME = /[\'\"][\w\-\_\/\.]+[\'\"]/;

/**
 * Find definition and references for page
 */
export class PageReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const page = this.getPage(document, position);
        if (!page) {
            return;
        }

        const locations: vscode.Location[] = await page.findReferences();

        if (context.includeDeclaration) {
            locations.push(new vscode.Location(
                vscode.Uri.file(page.path),
                new vscode.Position(0, 0)
            ));
        }

        return locations;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        const page = this.getPage(document, position);
        if (!page) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(page.path),
            new vscode.Position(0, 0)
        );
    }

    private getPage(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const mayBePage = document.getWordRangeAtPosition(position, PAGE_STR)
            || document.getWordRangeAtPosition(position, PAGE_URL);

        if (!mayBePage) {
            return;
        }

        const nameRange = document.getWordRangeAtPosition(position, FILE_NAME);
        if (!nameRange) {
            return;
        }

        const pageName = document.lineAt(nameRange.start.line).text.slice(nameRange.start.character + 1, nameRange.end.character - 1);

        return themeFile.owner.pages.find(file => file.name === pageName);
    }
}
