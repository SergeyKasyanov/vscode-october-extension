import * as vscode from "vscode";
import { Component, ComponentProperty } from "../../types/plugin/component";
import { ConfigKey } from "../../types/configKey";
import { Permission } from "../../types/plugin/permission";
import { TwigFilter } from "../../types/twig/twigFilter";
import { TwigFunction } from "../../types/twig/twigFunction";
import { TwigTag } from "../../types/twig/twigTag";
import { TwigTest } from "../../types/twig/twigTest";

export class CompletionItemFactory {
    public static fromComponent(component: Component, alias: string) {
        let item = new vscode.CompletionItem(alias, vscode.CompletionItemKind.Class);
        item.detail = component.data.name;

        let docString;
        if (component.data.description) {
            docString = component.data.description + `

`;
        }
        docString += `*From: ${component.data.plugin}*`;

        item.documentation = new vscode.MarkdownString(docString);

        return item;
    }

    public static fromComponentProperty(property: ComponentProperty, suffix: string = ' = ') {
        let item = new vscode.CompletionItem(property.name, vscode.CompletionItemKind.Property);
        item.detail = property.title;
        item.documentation = property.description;
        item.insertText = property.name + suffix;

        return item;
    }

    public static fromConfigKey(configKey: ConfigKey) {
        let item = new vscode.CompletionItem(configKey.key, vscode.CompletionItemKind.Enum);
        item.detail = configKey.value;

        return item;
    }

    public static fromPermission(permission: Permission) {
        let item = new vscode.CompletionItem(permission.code, vscode.CompletionItemKind.Enum);
        item.detail = permission.label.includes('::') ? undefined : permission.label;
        item.documentation = permission.comment ? permission.comment : undefined;

        return item;
    }

    public static fromTwigFunction(func: TwigFunction) {
        let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
        item.detail = func.name;

        if (func.doc) {
            item.documentation = func.doc instanceof vscode.MarkdownString
                ? func.doc
                : new vscode.MarkdownString(func.doc);
        }

        item.insertText = new vscode.SnippetString(func.snippet);

        return item;
    }

    public static fromTwigTag(tag: TwigTag) {
        let item = new vscode.CompletionItem(tag.name, vscode.CompletionItemKind.Property);
        item.detail = tag.name;
        item.documentation = tag.doc instanceof vscode.MarkdownString
            ? tag.doc
            : new vscode.MarkdownString(tag.doc);
        item.insertText = new vscode.SnippetString(tag.snippet);

        return item;
    }

    public static fromTwigFilter(filter: TwigFilter) {
        let item = new vscode.CompletionItem(filter.name, vscode.CompletionItemKind.Function);
        item.detail = filter.name;
        item.documentation = filter.doc instanceof vscode.MarkdownString
            ? filter.doc
            : new vscode.MarkdownString(filter.doc);
        item.insertText = new vscode.SnippetString(filter.snippet);

        return item;
    }

    public static fromTwigTest(test: TwigTest) {
        let item = new vscode.CompletionItem(test.name, vscode.CompletionItemKind.EnumMember);
        item.detail = test.name;
        item.documentation = test.doc instanceof vscode.MarkdownString
            ? test.doc
            : new vscode.MarkdownString(test.doc);
        item.insertText = new vscode.SnippetString(test.snippet);

        return item;
    }
}
