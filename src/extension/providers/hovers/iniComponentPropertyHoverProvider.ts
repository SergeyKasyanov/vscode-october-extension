import * as vscode from "vscode";
import { Project } from "../../../services/project";
import { splitFrontendFile } from "../../../helpers/splitFrontendFile";

export class IniComponentPropertyHoverProvider implements vscode.HoverProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        this.document = document;
        this.position = position;

        const prop = this.findComponentProperty();
        if (prop === undefined) {
            return;
        }

        let docString = `**${prop.title}**

${prop.description}`;

        let hover = new vscode.Hover(docString);

        return new Promise(resolve => {
            resolve(hover);
        });
    }

    private findComponentProperty() {
        const documentSections = splitFrontendFile(this.document!.getText());

        // ini section can be in file with 2 or 3 sections
        if (documentSections.length < 2) {
            return;
        }

        // component name
        if (this.document!.lineAt(this.position!.line).text.startsWith('[')) {
            return;
        }

        let component: string | undefined;
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
                component = lineText.slice(1, -1).split(/\s+/)[0];
            }

            line++;
        }

        if (component === undefined) {
            return;
        }

        const ocComponent = Project.instance.getComponent(component);
        if (ocComponent === undefined) {
            return;
        }

        const wordRange = this.document!.getWordRangeAtPosition(this.position!);
        if (!wordRange) {
            return;
        }

        let word = this.document!
            .lineAt(this.position!.line)
            .text
            .slice(wordRange.start.character, wordRange.end.character);

        return ocComponent.data.props[word];
    }
}
