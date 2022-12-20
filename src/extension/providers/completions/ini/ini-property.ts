import * as vscode from "vscode";
import { Layout } from "../../../../domain/entities/theme/layout";
import { Page } from "../../../../domain/entities/theme/page";
import { Partial } from "../../../../domain/entities/theme/partial";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import * as properties from "../../../../domain/static/ini-properties";

/**
 * Completions for theme file property names.
 *
 * title =
 * url =
 * layout =
 * description =
 * meta_title =
 * meta_description =
 */
export class IniProperty implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideFileConfig(document.offsetAt(position))) {
            return;
        }

        const eqIndex = document.lineAt(position.line).text.indexOf('=');
        if (eqIndex > -1 && position.character >= eqIndex) {
            return;
        }

        if (themeFile instanceof Layout) {
            return this.layoutProperties();
        }

        if (themeFile instanceof Page) {
            return this.pageProperties();
        }

        if (themeFile instanceof Partial) {
            return this.partialProperties();
        }
    }

    /**
     * Completions for layout config
     *
     * @returns
     */
    private layoutProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = new vscode.SnippetString('description = "$0"');
        description.detail = properties.layout.description.title;
        description.documentation = new vscode.MarkdownString(properties.layout.description.description);

        return [description];
    }

    /**
     * Completions for page config
     *
     * @returns
     */
    private pageProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let title = new vscode.CompletionItem('title', vscode.CompletionItemKind.Property);
        title.insertText = new vscode.SnippetString('title = "$0"');
        title.detail = properties.page.title.title;
        title.documentation = new vscode.MarkdownString(properties.page.title.description);

        let url = new vscode.CompletionItem('url', vscode.CompletionItemKind.Property);
        url.insertText = new vscode.SnippetString('url = "$0"');
        url.detail = properties.page.url.title;
        url.documentation = new vscode.MarkdownString(properties.page.url.description);

        let layout = new vscode.CompletionItem('layout', vscode.CompletionItemKind.Property);
        layout.insertText = new vscode.SnippetString('layout = "$0"');
        layout.detail = properties.page.layout.title;
        layout.documentation = new vscode.MarkdownString(properties.page.layout.description);

        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = new vscode.SnippetString('description = "$0"');
        description.detail = properties.page.description.title;
        description.documentation = new vscode.MarkdownString(properties.page.description.description);

        let isHidden = new vscode.CompletionItem('is_hidden', vscode.CompletionItemKind.Property);
        isHidden.insertText = new vscode.SnippetString('is_hidden = $0');
        isHidden.detail = properties.page.isHidden.title;
        isHidden.documentation = new vscode.MarkdownString(properties.page.isHidden.description);

        let metaTitle = new vscode.CompletionItem('meta_title', vscode.CompletionItemKind.Property);
        metaTitle.insertText = new vscode.SnippetString('meta_title = "$0"');
        metaTitle.detail = properties.page.metaTitle.title;
        metaTitle.documentation = new vscode.MarkdownString(properties.page.metaTitle.description);

        let metaDescription = new vscode.CompletionItem('meta_description', vscode.CompletionItemKind.Property);
        metaDescription.insertText = new vscode.SnippetString('meta_description = "$0"');
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

    /**
     * Completions for partial config
     *
     * @returns
     */
    private partialProperties(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let description = new vscode.CompletionItem('description', vscode.CompletionItemKind.Property);
        description.insertText = new vscode.SnippetString('description = "$0"');
        description.detail = properties.partial.description.title;
        description.documentation = new vscode.MarkdownString(properties.partial.description.description);

        return [description];
    }
}
