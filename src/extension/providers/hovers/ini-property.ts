import * as vscode from "vscode";
import { Layout } from "../../../domain/entities/theme/layout";
import { Page } from "../../../domain/entities/theme/page";
import { Partial } from "../../../domain/entities/theme/partial";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import * as iniProperties from "../../../domain/static/ini-properties";
import { Str } from "../../../helpers/str";
import { Hover } from "../../factories/hover-factory";

/**
 * Hover info for ini properties of theme files
 *
 * url = "/"
 * layout = "main"
 * ...
 */
export class IniProperty implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideIni(document.offsetAt(position))) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        let propertyName = document.lineAt(position).text
            .slice(wordRange.start.character, wordRange.end.character);
        if (!propertyName) {
            return;
        }

        propertyName = Str.camelCase(propertyName);

        let property: iniProperties.IniProperty | undefined;

        if (themeFile instanceof Layout) {
            property = iniProperties.layout[propertyName];
        } else if (themeFile instanceof Page) {
            property = iniProperties.page[propertyName];
        } else if (themeFile instanceof Partial) {
            property = iniProperties.partial[propertyName];
        }

        if (!property) {
            return;
        }

        return Hover.fromIniProperty(property);
    }
}
