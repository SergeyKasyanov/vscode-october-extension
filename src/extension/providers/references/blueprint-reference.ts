import * as vscode from 'vscode';
import { Blueprint } from '../../../domain/entities/blueprint';
import { MarkupFile } from '../../../domain/entities/theme/theme-file';
import { Store } from '../../../domain/services/store';
import { YamlHelpers } from '../../helpers/yaml-helpers';
import path = require('path');
import { Str } from '../../../helpers/str';

const HANDLE_INI = /[\'\"][\w\\]+[\'\"]/g;
const HANDLE_YAML = /[\'\"]?[\w\\]+[\'\"]?/g;
const HANDLE_INI_PROPERTY = /handle\s*=\s*[\'\"][\w\\]+[\'\"]/g;
const HANDLE_YAML_PROPERTY = /(handle|source|parent):\s*[\'\"]?[\w\\]+[\'\"]?/g;

/**
 * Definitions and references for tailor blueprint
 */
export class BlueprintReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const blueprint = this.getBlueprint(document, position);
        if (!blueprint) {
            return;
        }

        const locations = await blueprint.findReferences();

        if (context.includeDeclaration) {
            const handlePosition = await blueprint.handlePosition();
            if (handlePosition) {
                locations.push(new vscode.Location(
                    vscode.Uri.file(blueprint.path),
                    handlePosition
                ));
            }
        }

        return locations;
    }

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined> {

        const blueprint = this.getBlueprint(document, position);
        if (!blueprint) {
            return;
        }

        const handlePosition = await blueprint.handlePosition();
        if (!handlePosition) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(blueprint.path),
            handlePosition
        );
    }

    private getBlueprint(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Blueprint | undefined {
        let handle: string | undefined;

        if (document.fileName.endsWith('htm')) {
            handle = this.getHandleFromThemeFile(document, position);
        } else if (document.fileName.endsWith('yaml')) {
            handle = this.getHandleFromBlueprint(document, position);
        }

        if (!handle) {
            return;
        }

        return Store.instance
            .findProject(document.fileName)
            ?.appDir
            ?.blueprints
            .find(b => b.handle === handle);
    }


    private getHandleFromThemeFile(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {
        const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideIni(document.offsetAt(position))) {
            return;
        }

        const handleRange = document.getWordRangeAtPosition(position, HANDLE_INI);
        if (!handleRange) {
            return;
        }

        const lineText = document.lineAt(handleRange.start.line).text;

        const match = lineText.match(HANDLE_INI_PROPERTY);
        if (!match) {
            return;
        }

        const clicked = lineText.slice(handleRange.start.character, handleRange.end.character);
        const value = lineText.split('=')[1]?.trim();
        if (clicked !== value) {
            return;
        }

        return Str.unquote(clicked);
    }

    private getHandleFromBlueprint(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {
        if (!document.fileName.includes(path.join('app', 'blueprints'))) {
            return;
        }

        const handleRange = document.getWordRangeAtPosition(position, HANDLE_YAML);
        if (!handleRange) {
            return;
        }

        const lineText = document.lineAt(handleRange.start.line).text;

        const match = lineText.match(HANDLE_YAML_PROPERTY);
        if (!match) {
            return;
        }

        let clicked = lineText.slice(handleRange.start.character, handleRange.end.character);
        clicked = Str.unquote(clicked);

        const value = YamlHelpers.getKeyAndValue(match[0]).value;

        return clicked === value ? clicked : undefined;
    }
}
