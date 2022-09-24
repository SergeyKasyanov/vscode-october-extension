import * as vscode from "vscode";
import { Project } from "../../../../services/project";
import { ComponentData } from "../../../../types/plugin/component";
import { splitFrontendFile } from "../../../../helpers/splitFrontendFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";

/**
 * Completions for component properties in INI section of theme file.
 *
 * [blogPost]
 * slug = ":slug"
 */
export class IniComponentPropertyCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        const componentData = this.determineCurrentComponentAndGetData();
        if (componentData === undefined) {
            return [];
        }

        let result = [];
        const props = componentData.props;

        for (const p in props) {
            if (Object.prototype.hasOwnProperty.call(props, p)) {
                const prop = props[p];

                result.push(CompletionItemFactory.fromComponentProperty(prop));
            }
        }

        return result;
    }

    private determineCurrentComponentAndGetData(): ComponentData | undefined {
        const documentSections = splitFrontendFile(this.document!.getText());

        // ini section can be in file with 2 or 3 sections
        if (documentSections.length < 2) {
            return;
        }

        const currentLineText = this.document!.lineAt(this.position!.line).text;

        // component name
        if (currentLineText.startsWith('[')) {
            return;
        }

        if (currentLineText.includes('=')) {
            const propName = currentLineText.split(/\s*=\s*/)[0];
            if (propName.length < this.position!.character) {
                return;
            }
        }

        let componentName: string | undefined;
        let line = 0;

        while (line < this.document!.lineCount) {
            if (this.document!.lineAt(line).text === "==") {
                return;
            }

            if (line === this.position!.line) {
                break;
            }

            if (this.document!.lineAt(line).text.startsWith('[')) {
                let lineText = this.document!.lineAt(line).text;
                componentName = lineText.slice(1, -1).split(/\s+/)[0];
            }

            line++;
        }

        if (componentName === undefined) {
            return;
        }

        const component = Project.instance.getComponent(componentName);

        if (component === undefined) {
            return;
        }

        return component.data;
    }
}
