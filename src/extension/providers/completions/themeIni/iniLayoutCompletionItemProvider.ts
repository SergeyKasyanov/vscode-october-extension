import * as vscode from "vscode";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Themes } from "../../../../services/themes";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for layout names in INI section of theme files.
 *
 * layout = "layoutName"
 */
export class IniLayoutCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!LineSectionChecks.insideFileConfigSection(document, position)) {
            return [];
        }

        if (!document.lineAt(position.line).text.startsWith('layout')) {
            return [];
        }

        const parsed = ThemeFileUtils.parseFileName(document.fileName);
        const theme = Themes.instance.getTheme(parsed.theme);

        if (!theme) {
            return;
        }

        return theme.getLayoutNames().map(layout =>
            new vscode.CompletionItem(layout, vscode.CompletionItemKind.EnumMember)
        );
    }
}
