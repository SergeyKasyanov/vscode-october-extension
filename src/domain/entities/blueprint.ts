import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { YamlHelpers } from '../../extension/helpers/yaml-helpers';
import { Str } from '../../helpers/str';
import { OctoberEntity } from './october-entity';
import { AppDirectory } from './owners/app-directory';
import { Store } from '../services/store';
import { MarkupFile } from './theme/theme-file';

export type BlueprintType = 'entry' | 'single' | 'structure' | 'stream' | 'global' | 'mixin';

export class Blueprint extends OctoberEntity {

    constructor(
        protected _owner: AppDirectory,
        protected _path: string,
        protected _name: string,
    ) {
        super(_owner, _path, _path);
    }

    /**
     * Directory containing filter widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['blueprints'];
    }

    /**
     * Blueprint uuid
     */
    get uuid(): string | undefined {
        return this.parse().uuid;
    }

    /**
     * Blueprint type
     */
    get type(): BlueprintType | undefined {
        return this.parse().type;
    }

    /**
     * Blueprint handle
     */
    get handle(): string {
        return this._name;
    }

    /**
     * Blueprint handle
     */
    get entityName(): string | undefined {
        return this.parse().name;
    }

    /**
     * Blueprint provides primary navigation
     */
    get hasPrimaryNavigation(): boolean {
        return typeof this.parse().primaryNavigation === 'object';
    }

    /**
     * Position of handle inside file
     */
    async handlePosition(): Promise<vscode.Position | undefined> {
        const regexStr = `handle:\\s*${Str.replaceAll(this.handle, '\\', '\\\\')}`;
        const regex = new RegExp(regexStr, 'g');

        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(this.path));
        const match = document.getText().matchAll(regex).next()?.value;
        return match ? document.positionAt(match.index!) : undefined;
    }

    /**
     * Finds usages of blueprint
     */
    async findReferences(): Promise<vscode.Location[]> {
        return [
            ...(await this.findReferencesInBlueprints()),
            ...(await this.findReferencesInThemes())
        ];
    }

    private async findReferencesInBlueprints() {
        const locations: vscode.Location[] = [];

        const lokingForMixinUsages = this.type === 'mixin';

        const regexStr = lokingForMixinUsages
            ? `source:\\s*${Str.replaceAll(this.handle, '\\', '\\\\')}\r?\n`
            : `(parent|handle):\\s*${Str.replaceAll(this.handle, '\\', '\\\\')}\r?\n`;

        const regex = new RegExp(regexStr, 'g');

        const processedFiles: string[] = [];
        for (const blueprint of this._owner.blueprints) {
            if (blueprint.handle === this.handle) {
                continue;
            }

            if (processedFiles.includes(blueprint.path)) {
                continue;
            }

            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(blueprint.path));
            const matches = document.getText().matchAll(regex);
            for (const match of matches) {
                const position = document.positionAt(match.index!);

                if (lokingForMixinUsages) {
                    const isMixin = YamlHelpers.getSibling(document, position, 'type') === 'mixin';
                    if (!isMixin) {
                        continue;
                    }
                }

                const start = new vscode.Position(position.line, document.lineAt(position.line).text.indexOf(this.handle));
                const end = start.translate(0, this.handle.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(document.uri, range));
            }

            processedFiles.push(blueprint.path);
        }

        return locations;
    }

    private async findReferencesInThemes() {
        const locations: vscode.Location[] = [];

        if (this.type === 'mixin') {
            return locations;
        }

        const regexStr = `handle\\s*=\\s*[\\'\\"]${Str.replaceAll(this.handle, '\\', '\\\\')}[\\'\\"]`;
        const regex = new RegExp(regexStr, 'g');

        const themeFiles: string[] = [];

        this.owner.project.themes.forEach(theme => {
            theme.layouts.forEach(l => themeFiles.push(l.path));
            theme.pages.forEach(l => themeFiles.push(l.path));
            theme.partials.forEach(l => themeFiles.push(l.path));
        });

        const processedFiles: string[] = [];
        for (const filePath of themeFiles) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const themeFile = Store.instance.findEntity(document.fileName) as MarkupFile;

            const matches = document.getText().matchAll(regex);
            for (const match of matches) {
                if (!themeFile.isOffsetInsideIni(match.index!)) {
                    continue;
                }

                if (processedFiles.includes(filePath)) {
                    continue;
                }

                const position = document.positionAt(match.index!);
                const start = new vscode.Position(position.line, document.lineAt(position.line).text.indexOf(this.handle));
                const end = start.translate(0, this.handle.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(document.uri, range));
            }

            processedFiles.push(filePath);
        }

        return locations;
    }

    /**
     * Parse blueprint's yaml file
     *
     * @returns
     */
    private parse(): any {
        try {
            return yaml.parse(this.fileContent!);
        } catch (err) {
            return {};
        }
    }
}
