import * as vscode from "vscode";
import { Layout } from "../../../domain/entities/theme/layout";
import { Page } from "../../../domain/entities/theme/page";
import { Store } from "../../../domain/services/store";

/**
 * Find definition and references for layout
 */
export class LayoutReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const { thisPage, layout } = this.getLayout(document, position) || {};
        if (!thisPage || !layout) {
            return;
        }

        const layoutNameRange = new vscode.Range(
            document.positionAt(thisPage.layoutOffset!.start),
            document.positionAt(thisPage.layoutOffset!.end),
        );

        if (!layoutNameRange.contains(position)) {
            return;
        }

        const locations: vscode.Location[] = [];

        for (const theme of [thisPage.owner, ...thisPage.owner.childrenThemes]) {
            for (const page of theme.pages) {
                if (page.layout?.name === layout.name) {
                    const pageDoc = page.path === document.fileName
                        ? document
                        : await vscode.workspace.openTextDocument(vscode.Uri.file(page.path));

                    const range = new vscode.Range(
                        pageDoc.positionAt(page.layoutOffset!.start),
                        pageDoc.positionAt(page.layoutOffset!.end)
                    );

                    const location = new vscode.Location(vscode.Uri.file(page.path), range);
                    locations.push(location);
                }
            }
        }

        if (context.includeDeclaration) {
            locations.push(new vscode.Location(
                vscode.Uri.file(layout.path),
                new vscode.Position(0, 0)
            ));
        }

        return locations;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        const { thisPage, layout } = this.getLayout(document, position) || {};
        if (!thisPage || !layout) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(layout.path),
            new vscode.Position(0, 0)
        );
    }

    private getLayout(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { thisPage: Page; layout: Layout; } | undefined {
        const thisPage = Store.instance.findEntity(document.fileName) as Page;
        if (!(thisPage instanceof Page)) {
            return;
        }

        const layout = thisPage.layout;
        if (!layout) {
            return;
        }

        const layoutNameRange = new vscode.Range(
            document.positionAt(thisPage.layoutOffset!.start),
            document.positionAt(thisPage.layoutOffset!.end),
        );

        if (!layoutNameRange.contains(position)) {
            return;
        }

        return { thisPage, layout };
    }
}
