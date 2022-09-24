import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { ThemeFileUtils } from "../../../helpers/themeFileUtils";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";
import { HoverFactory } from "../../factories/hoverFactory";

export class TwigComponentHoverProvider implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.componentTag);
        if (!wordRange) {
            return;
        }

        const quotedComponentAlias = document
            .lineAt(position.line)
            .text
            .slice(wordRange.start.character, wordRange.end.character)
            .match(regExps.componentName);

        if (!quotedComponentAlias) {
            return;
        }

        let componentAlias = quotedComponentAlias[0].slice(1, -1);
        if (!componentAlias) {
            return;
        }

        const components = ThemeFileUtils.getComponents(thisFile, true);

        const component = components[componentAlias];
        if (!component) {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromComponent(component));
        });
    }
}
