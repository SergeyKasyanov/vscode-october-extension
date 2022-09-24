import * as vscode from "vscode";
import { Themes } from "../../../../services/themes";
import { Layout } from "../../../../types/theme/layout";
import { Page } from "../../../../types/theme/page";
import { Partial } from "../../../../types/theme/partial";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";
import * as properties from "../../../staticData/iniProperties";

/**
 * Completions for theme file property names.
 *
 * url =
 * layout =
 * description =
 */
export class IniPropertyCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!thisFile || !(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const mayBeCompleted = LineSectionChecks.insideFileConfigSection(document, position)
            && !document.lineAt(position.line).text.includes('=');

        if (!mayBeCompleted) {
            return;
        }

        if (thisFile instanceof Layout) {
            return this.layoutProperties();
        }

        if (thisFile instanceof Page) {
            return this.pageProperties();
        }

        if (thisFile instanceof Partial) {
            return this.partialProperties();
        }
    }

    private layoutProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = 'description = ';
        description.detail = properties.layout.description.title;
        description.documentation = new vscode.MarkdownString(properties.layout.description.description);

        return [description];
    }

    private pageProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let title = new vscode.CompletionItem('title', vscode.CompletionItemKind.Property);
        title.insertText = 'title = ';
        title.detail = properties.page.title.title;
        title.documentation = new vscode.MarkdownString(properties.page.title.description);

        let url = new vscode.CompletionItem('url', vscode.CompletionItemKind.Property);
        url.insertText = 'url = ';
        url.detail = properties.page.url.title;
        url.documentation = new vscode.MarkdownString(properties.page.url.description);

        let layout = new vscode.CompletionItem('layout', vscode.CompletionItemKind.Property);
        layout.insertText = 'layout = ';
        layout.detail = properties.page.layout.title;
        layout.documentation = new vscode.MarkdownString(properties.page.layout.description);

        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = 'description = ';
        description.detail = properties.page.description.title;
        description.documentation = new vscode.MarkdownString(properties.page.description.description);

        let isHidden = new vscode.CompletionItem('is_hidden', vscode.CompletionItemKind.Property);
        isHidden.insertText = 'is_hidden = 1';
        isHidden.detail = properties.page.isHidden.title;
        isHidden.documentation = new vscode.MarkdownString(properties.page.isHidden.description);

        let metaTitle = new vscode.CompletionItem('meta_title', vscode.CompletionItemKind.Property);
        metaTitle.insertText = 'meta_title = ';
        metaTitle.detail = properties.page.metaTitle.title;
        metaTitle.documentation = new vscode.MarkdownString(properties.page.metaTitle.description);

        let metaDescription = new vscode.CompletionItem('meta_description', vscode.CompletionItemKind.Property);
        metaDescription.insertText = 'meta_description = ';
        metaDescription.detail = properties.page.metaDescription.title;
        metaDescription.documentation = new vscode.MarkdownString(properties.page.metaDescription.description);

        return [
            title,
            url,
            layout,
            description,
            isHidden,
            metaTitle,
            metaDescription
        ];
    }

    private partialProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = 'description = ';
        description.detail = properties.partial.description.title;
        description.documentation = new vscode.MarkdownString(properties.partial.description.description);

        return [description];
    }
}
