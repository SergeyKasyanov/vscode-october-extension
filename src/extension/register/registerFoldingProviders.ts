import * as vscode from "vscode";
import { enableThemeFilesFolding } from "../../config";
import { octoberTplSelector } from "../../helpers/fileSelectors";
import { DocumentSectionFoldingProvider } from "../providers/foldings/documentSectionFoldingProvider";

export function registerFoldingProviders(context: vscode.ExtensionContext) {
    if (enableThemeFilesFolding()) {
        context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(octoberTplSelector, new DocumentSectionFoldingProvider));
    }
}
