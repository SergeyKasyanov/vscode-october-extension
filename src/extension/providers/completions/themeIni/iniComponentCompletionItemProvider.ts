import * as vscode from "vscode";
import { Project } from "../../../../services/project";
import { splitFrontendFile } from "../../../../helpers/splitFrontendFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";

/**
 * Completions for component names in INI section of theme files.
 *
 * [blogPost]
 */
export class IniComponentCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!this.isCurrentLineAwaitsComponentsCompletions(document, position)) {
            return [];
        }

        let result = [];

        const components = Project.instance.getComponents();

        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const component = components[alias];

                result.push(CompletionItemFactory.fromComponent(component, component.name));
            }
        }

        return result;
    }

    private isCurrentLineAwaitsComponentsCompletions(document: vscode.TextDocument, position: vscode.Position): boolean {
        const documentSections = splitFrontendFile(document.getText());

        // ini section can be in file with 2 or 3 sections
        if (documentSections.length < 2) {
            return false;
        }

        let line = 0;

        while (line < document.lineCount) {
            if (document.lineAt(line).text === "==") {
                return false;
            }

            if (position.line === line) {
                return document.lineAt(position.line).text.startsWith('[');
            }

            line++;
        }

        return false;
    }
}
