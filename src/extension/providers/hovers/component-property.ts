import * as vscode from "vscode";
import { ComponentProperty as _Property } from "../../../domain/entities/classes/component";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { Hover } from "../../factories/hover-factory";

const COMPONENT_ATTACHMENT = /\[[\w\_]+(\s+[\w\_]+){0,1}\]/;
const COMPONENT_TAG_WITH_PARAMS = /\{\%\s*component\s*[\'\"][\w\_]+[\'\"].*\%\}/;
const COMPONENT_TAG_WITH_NAME = /component\s*[\'\"][\w\_]+[\'\"]/;

/**
 * Hover info for component properties
 *
 * [blogPost]
 * slug = :slug
 *
 * {% component 'blogPost' showTags = false %}
 */
export class ComponentProperty implements vscode.HoverProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private themeFile?: MarkupFile;

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        this.document = document;
        this.position = position;

        this.themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(this.themeFile instanceof MarkupFile)) {
            return;
        }

        const offset = document.offsetAt(position);
        let property: _Property | undefined;

        if (this.themeFile.isOffsetInsideIni(offset)) {
            property = this.findPropertyForIni();
        } else if (this.themeFile.isOffsetInsideTwig(offset)) {
            property = this.findPropertyForTwig();
        }

        if (!property) {
            return;
        }

        return Hover.fromComponentProperty(property);
    }

    /**
     * Find property if position in ini section
     *
     * @returns
     */
    private findPropertyForIni(): _Property | undefined {

        const range = this.document!.getWordRangeAtPosition(this.position!);
        if (!range) {
            return;
        }

        const propertyName = this.document!.lineAt(this.position!.line).text
            .slice(range.start.character, range.end.character);

        let line = this.position!.line;

        while (line > 0) {
            const match = this.document!.lineAt(line).text.match(COMPONENT_ATTACHMENT);
            if (match) {
                const componentAlias = match[0]
                    .slice(1, match[0].length - 1)
                    .trim()
                    .split(/\s+/)
                    .reverse()[0];

                return this.themeFile?.components[componentAlias]?.properties
                    .find(p => p.name === propertyName);
            }

            line--;
        }
    }

    /**
     * Find property if position in twig section
     *
     * @returns
     */
    private findPropertyForTwig(): _Property | undefined {
        const propertyRange = this.document!.getWordRangeAtPosition(this.position!);
        if (!propertyRange) {
            return;
        }

        const propertyName = this.document!.lineAt(this.position!.line).text
            .slice(propertyRange.start.character, propertyRange.end.character);

        const componentRange = this.document!.getWordRangeAtPosition(this.position!, COMPONENT_TAG_WITH_PARAMS);
        if (!componentRange) {
            return;
        }

        const componentTag = this.document!
            .lineAt(this.position!.line)
            .text
            .slice(
                componentRange.start.character,
                componentRange.end.character
            );

        const componentAlias = componentTag.match(COMPONENT_TAG_WITH_NAME)![0].split(/[\'\"]/)[1];
        const component = this.themeFile!.components[componentAlias];

        if (!component) {
            return;
        }

        return this.themeFile?.components[componentAlias]?.properties
            .find(p => p.name === propertyName);
    }
}
