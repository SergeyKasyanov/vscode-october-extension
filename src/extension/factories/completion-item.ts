import * as vscode from 'vscode';
import { Component, ComponentProperty } from "../../domain/entities/classes/component";
import { Model } from '../../domain/entities/classes/model';
import { Permission } from '../../domain/entities/types';
import { Content } from '../../domain/entities/theme/content';
import { Page } from '../../domain/entities/theme/page';
import { MarkupFile } from '../../domain/entities/theme/theme-file';
import { TwigFilter } from '../../domain/static/twig-filters';
import { TwigFunction } from '../../domain/static/twig-functions';
import { TwigTag } from '../../domain/static/twig-tags';
import { TwigTest } from '../../domain/static/twig-tests';

export class CompletionItem {
    /**
     * Create completion item from component
     *
     * @param component
     * @returns
     */
    static fromComponent(component: Component, alias?: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(alias || component.alias!);
        item.detail = component.details.name;

        let docString = '';
        if (component.details.description.length > 0) {
            docString = component.details.description + `

`;
        }
        docString += `*Class: ${component.fqn}*

`;
        docString += `*From: ${component.owner.name}*

`;

        item.documentation = new vscode.MarkdownString(docString);
        item.insertText = alias || component.alias;

        return item;
    }

    /**
     * Create completion item from component property
     *
     * @param property
     * @returns
     */
    static fromComponentProperty(property: ComponentProperty, suffix: string = ''): vscode.CompletionItem {
        const item = new vscode.CompletionItem(property.name);

        if (property.title) {
            item.detail = property.title;
        }

        if (property.description) {
            item.documentation = property.description;
        }

        item.insertText = new vscode.SnippetString(property.name + suffix);

        return item;
    }

    /**
     * Create completion item from Model class
     *
     * @param model
     * @returns
     */
    static fromModel(model: Model) {
        const item = new vscode.CompletionItem(model.fqn, vscode.CompletionItemKind.Class);
        item.detail = model.fqn;

        return item;
    }

    /**
     * Create completion item from Permission
     *
     * @param permission
     * @returns
     */
    static fromPermission(permission: Permission) {
        const item = new vscode.CompletionItem(permission.code);
        item.detail = permission.label;
        item.documentation = permission.comment;

        return item;
    }

    /**
     * Create completion item from twig tag
     *
     * @param tag
     * @returns
     */
    static fromTwigTag(tag: TwigTag): vscode.CompletionItem {
        const item = new vscode.CompletionItem(tag.name, vscode.CompletionItemKind.Property);
        item.detail = tag.name;
        item.documentation = tag.doc instanceof vscode.MarkdownString
            ? tag.doc
            : new vscode.MarkdownString(tag.doc);
        item.insertText = new vscode.SnippetString(tag.snippet);

        return item;
    }

    /**
     * Create completion item from twig function
     *
     * @param func
     * @returns
     */
    static fromTwigFunction(func: TwigFunction): vscode.CompletionItem {
        const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
        item.detail = func.name;

        if (func.doc) {
            item.documentation = func.doc instanceof vscode.MarkdownString
                ? func.doc
                : new vscode.MarkdownString(func.doc);
        }

        item.insertText = new vscode.SnippetString(func.snippet);

        return item;
    }

    /**
     * Create completion item from twig filter
     *
     * @param filter
     * @returns
     */
    static fromTwigFilter(filter: TwigFilter) {
        const item = new vscode.CompletionItem(filter.name, vscode.CompletionItemKind.Function);
        item.detail = filter.name;

        if (filter.doc) {
            item.documentation = filter.doc instanceof vscode.MarkdownString
                ? filter.doc
                : new vscode.MarkdownString(filter.doc);
        }

        item.insertText = new vscode.SnippetString(filter.snippet);

        return item;
    }

    /**
     * Create completion item from twig test
     *
     * @param test
     * @returns
     */
    static fromTwigTest(test: TwigTest) {
        const item = new vscode.CompletionItem(test.name, vscode.CompletionItemKind.EnumMember);
        item.detail = test.name;
        item.documentation = test.doc;
        item.insertText = new vscode.SnippetString(test.snippet);

        return item;
    }

    /**
     * Create completion item from theme markup file
     *
     * @param markupFile
     * @returns
     */
    static fromThemeMarkupFile(markupFile: MarkupFile) {
        const item = new vscode.CompletionItem(markupFile.name, vscode.CompletionItemKind.EnumMember);
        item.detail = markupFile.name;

        let documentation = '';
        const pageConfig = markupFile.config;
        for (const key in pageConfig) {
            if (Object.prototype.hasOwnProperty.call(pageConfig, key)) {
                const value = pageConfig[key];
                documentation += `${key}: ${value}

`;
            }
        }

        if (documentation.length > 0) {
            item.documentation = new vscode.MarkdownString(documentation);
        }

        item.insertText = markupFile.name;

        return item;
    }

    /**
     * Create completion item from content file
     *
     * @param content
     * @returns
     */
    static fromContentFile(content: Content) {
        const item = new vscode.CompletionItem(content.name, vscode.CompletionItemKind.EnumMember);
        item.detail = content.name;
        item.insertText = content.name;

        return item;
    }
}
