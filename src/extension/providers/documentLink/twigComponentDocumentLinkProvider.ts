import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { ThemeFileUtils } from "../../../helpers/themeFileUtils";
import { Themes } from "../../../services/themes";
import { Component } from "../../../types/plugin/component";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";

export class TwigComponentDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private components: { [alias: string]: Component } = {};

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        this.components = ThemeFileUtils.getComponents(thisFile, true);

        let links: vscode.DocumentLink[] = [];

        let line = 0;
        while (line < document.lineCount) {
            this.getComponentsNamesFromLine(document.lineAt(line).text).forEach(comp => {
                const component = this.components[comp.componentAlias];
                if (component) {
                    links.push(
                        new vscode.DocumentLink(
                            new vscode.Range(new vscode.Position(line, comp.start), new vscode.Position(line, comp.end)),
                            vscode.Uri.file(component.filepath)
                        )
                    );
                }
            });

            line++;
        }

        return links;
    }

    private getComponentsNamesFromLine(lineText: string): {
        componentAlias: string,
        start: number,
        end: number
    }[] {
        let componentTags = [];

        let parsing = lineText;
        let sliced = 0;

        let found = this.findComponentTagInLine(parsing);
        while (found) {
            let componentAlias = found[0].replace(regExps.componentTagStart, '').slice(0, -1);
            const start = sliced + parsing.indexOf(componentAlias);
            const end = sliced + parsing.indexOf(componentAlias) + componentAlias.length;

            componentTags.push({ componentAlias, start, end, });

            const leftIndex = parsing.indexOf(found[0]) + found[0].length;
            sliced += leftIndex;
            parsing = parsing.slice(leftIndex);
            found = this.findComponentTagInLine(parsing);
        }

        return componentTags;
    }

    private findComponentTagInLine(lineText: string): RegExpExecArray | null {
        return regExps.componentTag.exec(lineText);
    }
}
