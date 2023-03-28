import * as vscode from "vscode";
import { Config } from "../../../../config";
import { OctoberEntity } from "../../../../domain/entities/october-entity";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { getPathCompletions } from "../../../helpers/path-autocomplete";
import path = require("path");

const PLUGINS = /plugins_path\s*\(\s*[\'\"]/g;
const THEMES = /themes_path\s*\(\s*[\'\"]/g;
const STORAGE = /storage_path\s*\(\s*[\'\"]/g;
const TEMP = /temp_path\s*\(\s*[\'\"]/g;
const APP = /app_path\s*\(\s*[\'\"]/g;
const BASE = /base_path\s*\(\s*[\'\"]/g;
const CONFIG = /config_path\s*\(\s*[\'\"]/g;
const LANG = /lang_path\s*\(\s*[\'\"]/g;
const PUBLIC = /public_path\s*\(\s*[\'\"]/g;

const PATH_PART = /^[\w\/\-\_\.]*$/;
const PATH = /[\w\/\-\_\.]+/;

/**
 * Completions for path helpers
 *
 * plugins_path('....');
 * themes_path('....');
 * storage_path('....');
 * temp_path('....');
 * app_path('....');
 * base_path('....');
 * config_path('....');
 * lang_path('....');
 * public_path('....');
 */
export class PathHelper implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private entity?: OctoberEntity;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        this.entity = Store.instance.findEntity(this.document!.fileName);

        if (!this.checkFile()) {
            return;
        }

        const root = this.getRoot();
        if (!root) {
            return;
        }

        let entered = '';

        const enteredRange = document.getWordRangeAtPosition(position, PATH);
        if (enteredRange) {
            const lineText = document.lineAt(enteredRange.start.line).text;
            entered = lineText.slice(enteredRange.start.character, enteredRange.end.character);

            if (!entered.startsWith('/')) {
                entered = '/' + entered;
            }

            if (!entered.endsWith('/')) {
                entered += '/';
            }
        }

        return getPathCompletions(root, entered, [])?.map(item => {
            item.range = document.getWordRangeAtPosition(position, PATH);

            if (item.label.toString().startsWith('/')) {
                item.insertText = item.label.toString().slice(1);
            }

            return item;
        });
    }

    private getRoot(): string | undefined {
        const content = this.document!.getText();
        const offset = this.document!.offsetAt(this.position!);

        let root: string | undefined;
        if (awaitsCompletions(content, offset, PLUGINS, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, Config.pluginsDirectory);
        } else if (awaitsCompletions(content, offset, THEMES, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, Config.themesDirectory);
        } else if (awaitsCompletions(content, offset, STORAGE, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'storage');
        } else if (awaitsCompletions(content, offset, TEMP, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'storage', 'temp');
        } else if (this.entity?.owner.project.platform?.hasAppDirectory && awaitsCompletions(content, offset, APP, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'app');
        } else if (awaitsCompletions(content, offset, BASE, PATH_PART)) {
            root = this.entity!.owner.project.path;
        } else if (awaitsCompletions(content, offset, CONFIG, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'config');
        } else if (this.entity?.owner.project.platform?.hasAppDirectory && awaitsCompletions(content, offset, LANG, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'app', 'lang');
        } else if (awaitsCompletions(content, offset, PUBLIC, PATH_PART)) {
            root = path.join(this.entity!.owner.project.path, 'public');
            if (!FsHelpers.exists(root)) {
                root = this.entity!.owner.project.path;
            }
        }

        return root;
    }

    private checkFile(): boolean {
        if (this.entity instanceof MarkupFile) {
            return this.entity.isOffsetInsidePhp(this.document!.offsetAt(this.position!));
        }

        return this.document!.fileName.endsWith('.php');
    }
}
