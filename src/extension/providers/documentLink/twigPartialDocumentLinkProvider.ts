import * as vscode from "vscode";
import { themesPath } from "../../../helpers/paths";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";

export class TwigPartialDocumentLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        let links: vscode.DocumentLink[] = [];

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        let line = 0;
        while (line < document.lineCount) {
            this.getPartialNamesFromLine(document.lineAt(line).text).forEach(p => {
                const partial = thisFile.theme.getPartial(p.partial);
                if (partial) {
                    links.push(
                        new vscode.DocumentLink(
                            new vscode.Range(new vscode.Position(line, p.start), new vscode.Position(line, p.end)),
                            vscode.Uri.file(themesPath(partial.filepath))
                        )
                    );
                }
            });

            line++;
        }

        return links;
    }

    private getPartialNamesFromLine(lineText: string): {
        partial: string,
        start: number,
        end: number
    }[] {
        let partials = [];

        let parsing = lineText;
        let sliced = 0;

        let found = this.findPartialTagInLine(parsing);
        while (found) {
            let partial = found[0].match(regExps.partialName)![0].slice(1, -1);
            const start = sliced + parsing.indexOf(partial);
            const end = sliced + parsing.indexOf(partial) + partial.length;

            if (partial.endsWith('.htm')) {
                partial = partial.slice(0, partial.length - 4);
            }

            partials.push({ partial, start, end, });

            const leftIndex = parsing.indexOf(found[0]) + found[0].length;
            sliced += leftIndex;
            parsing = parsing.slice(leftIndex);
            found = this.findPartialTagInLine(parsing);
        }

        return partials;
    }

    private findPartialTagInLine(lineText: string): RegExpExecArray | null {
        return regExps.partialTag.exec(lineText) || regExps.partialFunctionWithName.exec(lineText);
    }
}
