import * as vscode from "vscode";
import { themesPath } from "../../../helpers/paths";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";

export class TwigContentDocumentLinkProvider implements vscode.DocumentLinkProvider {
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
            this.getContentNamesFromLine(document.lineAt(line).text).forEach(c => {
                const content = thisFile.theme.getContent(c.content);
                if (content) {
                    links.push(
                        new vscode.DocumentLink(
                            new vscode.Range(new vscode.Position(line, c.start), new vscode.Position(line, c.end)),
                            vscode.Uri.file(themesPath(content.filepath))
                        )
                    );
                }
            });

            line++;
        }

        return links;
    }

    private getContentNamesFromLine(lineText: string): {
        content: string,
        start: number,
        end: number
    }[] {
        let contents = [];

        let parsing = lineText;
        let sliced = 0;

        let found = this.findContentTagInLine(parsing);
        while (found) {
            let content = found[0].replace(regExps.contentTagsStartGlobal, '').slice(0, -1);

            const start = sliced + parsing.indexOf(content);
            const end = sliced + parsing.indexOf(content) + content.length;

            content = this.normalizeContentName(content);

            contents.push({ content, start, end, });

            const leftIndex = parsing.indexOf(found[0]) + found[0].length;
            sliced += leftIndex;
            parsing = parsing.slice(leftIndex);
            found = this.findContentTagInLine(parsing);
        }

        return contents;
    }

    private findContentTagInLine(lineText: string): RegExpExecArray | null {
        return regExps.contentTag.exec(lineText);
    }

    private normalizeContentName(content: string): string {
        for (const ext of ['.htm', '.md', '.txt']) {
            if (content.endsWith(ext)) {
                return content;
            }
        }

        return content + '.htm';
    }
}
