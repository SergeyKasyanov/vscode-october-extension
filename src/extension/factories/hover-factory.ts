import * as vscode from 'vscode';
import { Component, ComponentProperty } from "../../domain/entities/classes/component";
import { Content } from '../../domain/entities/theme/content';
import { Layout } from '../../domain/entities/theme/layout';
import { Page } from '../../domain/entities/theme/page';
import { Partial } from '../../domain/entities/theme/partial';
import { ThemeFile, MarkupFile } from '../../domain/entities/theme/theme-file';
import { IniProperty } from '../../domain/static/ini-properties';
import { TwigFilter } from '../../domain/static/twig-filters';
import { TwigFunction } from '../../domain/static/twig-functions';
import { TwigTag } from '../../domain/static/twig-tags';
import { Str } from '../../helpers/str';

export class Hover {
    /**
     * Create hover from theme file
     *
     * @param file
     * @returns
     */
    static fromThemeFile(file: ThemeFile) {
        let docRows: string[] = [];

        if (file instanceof MarkupFile) {
            const fileConfig = file.config;
            for (const name in fileConfig) {
                if (Object.prototype.hasOwnProperty.call(fileConfig, name)) {
                    const value = fileConfig[name];
                    docRows.push(Str.ucFirst(name) + ': ' + value);
                }
            }
        }

        let docString = '';
        if (file instanceof Layout) {
            docString = `**Layout "${file.name}"**`;
        } else if (file instanceof Page) {
            docString = `**Page "${file.name}"**`;
        } else if (file instanceof Partial) {
            docString = `**Partial "${file.name}"**`;
        } else if (file instanceof Content) {
            docString = `**Content "${file.name}"**`;
        }

        if (docRows.length > 0) {
            docString += `

` + docRows.join(`

`);
        }

        return new vscode.Hover(new vscode.MarkdownString(docString));
    }

    /**
     * Create hover from component
     *
     * @param component
     * @returns
     */
    static fromComponent(component: Component): vscode.Hover {
        let doc = `**${component.name}**`;

        if (component.details.name) {
            doc += `

${component.details.name}`;
        }

        if (component.details.description) {
            doc += `

${component.details.description}`;
        }

        doc += `

*From ${component.owner.name}*`;

        return new vscode.Hover(doc);
    }

    /**
     * Create hover from component property
     *
     * @param property
     */
    static fromComponentProperty(property: ComponentProperty): vscode.Hover {
        let doc = `**${property.name}**`;

        if (property.title) {
            doc += `

${property.title}`;
        }

        if (property.description) {
            doc += `

${property.description}`;
        }

        return new vscode.Hover(doc);
    }

    /**
     * Create hover from ini property
     *
     * @param property
     * @returns
     */
    static fromIniProperty(property: IniProperty) {
        let docString = `**${property.title}**

${property.description}`;

        return new vscode.Hover(docString);
    }

    /**
     * Create hover for twig tag
     *
     * @param tag
     * @returns
     */
    static fromTwigTag(tag: TwigTag): vscode.Hover | undefined {
        if (tag.doc) {
            if (tag.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(tag.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(tag.doc));
        }
    }

    /**
     * Create hover for twig function
     *
     * @param func
     * @returns
     */
    static fromTwigFunction(func: TwigFunction): vscode.Hover | undefined {
        if (func.doc) {
            if (func.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(func.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(func.doc));
        }
    }

    /**
     * Create hover for twig filter
     *
     * @param filter
     * @returns
     */
    static fromTwigFilter(filter: TwigFilter): vscode.Hover | undefined {
        if (filter.doc) {
            if (filter.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(filter.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(filter.doc));
        }
    }
}
