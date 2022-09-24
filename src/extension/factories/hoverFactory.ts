import * as vscode from "vscode";
import { ucFirst } from "../../helpers/str";
import { Component } from "../../types/plugin/component";
import { TwigFilter } from "../../types/twig/twigFilter";
import { TwigFunction } from "../../types/twig/twigFunction";
import { TwigTag } from "../../types/twig/twigTag";
import { Content } from "../../types/theme/content";
import { Layout } from "../../types/theme/layout";
import { Page } from "../../types/theme/page";
import { Partial } from "../../types/theme/partial";
import { ThemeFile, ThemeMarkupFile } from "../../types/theme/themeFile";
import { IniProperty } from "../staticData/iniProperties";

export class HoverFactory {

    public static fromThemeFile(file: ThemeFile) {
        let docRows: string[] = [];

        if (file instanceof ThemeMarkupFile) {
            for (const name in file.properties) {
                if (Object.prototype.hasOwnProperty.call(file.properties, name)) {
                    const value = file.properties[name];
                    docRows.push(ucFirst(name) + ': ' + value);
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

    public static fromIniProperty(property: IniProperty) {
        let docString = `**${property.title}**

${property.description}`;

        return new vscode.Hover(docString);
    }

    public static fromComponent(component: Component) {
        let docString = `**${component.data.name}**`;

        if (component.data.description) {
            docString += `

${component.data.description}

`;
        }

        docString += `*From: ${component.data.plugin}*`;

        return new vscode.Hover(docString);
    }

    public static fromTwigTag(tag: TwigTag) {
        if (tag.doc) {
            if (tag.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(tag.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(tag.doc));
        }
    }

    public static fromTwigFunction(func: TwigFunction) {
        if (func.doc) {
            if (func.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(func.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(func.doc));
        }
    }

    public static fromTwigFilter(filter: TwigFilter): vscode.ProviderResult<vscode.Hover> {
        if (filter.doc) {
            if (filter.doc instanceof vscode.MarkdownString) {
                return new vscode.Hover(filter.doc);
            }

            return new vscode.Hover(new vscode.MarkdownString(filter.doc));
        }
    }

}
