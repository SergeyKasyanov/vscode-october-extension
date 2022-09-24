import * as vscode from "vscode";
import { splitFrontendFile } from "../../../helpers/splitFrontendFile";
import { Project } from "../../../services/project";
import { HoverFactory } from "../../factories/hoverFactory";

export class IniComponentHoverProvider implements vscode.HoverProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        this.document = document;
        this.position = position;

        const component = this.findComponent();
        if (!component) {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromComponent(component));
        });
    }

    private findComponent() {
        const documentSections = splitFrontendFile(this.document!.getText());

        // ini section can be in file with 2 or 3 sections
        if (documentSections.length < 2) {
            return;
        }

        const currentLineText = this.document!.lineAt(this.position!.line).text;

        // not component name
        if (!currentLineText.startsWith('[')) {
            return;
        }

        let line = 0;

        // if current line is after ==
        while (line < this.document!.lineCount) {
            const lineText = this.document!.lineAt(line).text;

            if (lineText === "==") {
                return;
            }

            if (line === this.position!.line) {
                break;
            }

            line++;
        }

        const wordRange = this.document!.getWordRangeAtPosition(this.position!);
        if (!wordRange) {
            return;
        }

        let word = this.document!
            .lineAt(this.position!.line)
            .text
            .slice(wordRange.start.character, wordRange.end.character);

        return Project.instance.getComponent(word);
    }
}
