import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { Controller } from '../../../domain/entities/classes/controller';
import { AppDirectory } from '../../../domain/entities/owners/app-directory';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Module } from '../../../domain/entities/owners/module';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { PathHelpers } from '../../../domain/helpers/path-helpers';
import { Store } from '../../../domain/services/store';
import { Str } from '../../../helpers/str';
import { DocumentLink } from '../../types/document-link';
import path = require('path');

const RELATION_RENDER = /->relationRender\s*\(\s*[\'\"]\w+[\'\"]/g;
const RELATION_NAME = /[\'\"]\w+[\'\"]/;

/**
 * Document links for relation names in relationRender calls
 */
export class RelationName implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: DocumentLink[] = [];

        const matches = document.getText().matchAll(RELATION_RENDER);
        for (const match of matches) {
            const urlMatch = match[0].match(RELATION_NAME)!;
            const url = urlMatch[0].slice(1, -1);

            const start = document.positionAt(match.index! + urlMatch.index! + 1);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    async resolveDocumentLink?(link: DocumentLink): Promise<vscode.DocumentLink | undefined> {
        const owner = Store.instance.findOwner(link.document!.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const controller = owner.findEntityByPath(link.document.fileName)
            || owner.findEntityByRelatedName(link.document.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const properties = controller.phpClassProperties;
        const relationConfig = properties?.relationConfig;
        if (!relationConfig || relationConfig.value?.kind !== 'string') {
            return;
        }

        let configPath = (relationConfig.value as phpParser.String).value;
        if (configPath.length === 0) {
            return;
        }

        if (configPath.startsWith('~')) {
            // ex: ~/plugins/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);
            configPath = PathHelpers.rootPath(controller.owner.project.path, configPath);
        } else if (configPath.startsWith('$')) {
            // ex: $/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);

            if (controller.owner instanceof Plugin) {
                configPath = PathHelpers.pluginsPath(controller.owner.project.path, configPath);
            } else if (controller.owner instanceof AppDirectory) {
                configPath = PathHelpers.appPath(controller.owner.project.path, configPath);
            } else if (controller.owner instanceof Module) {
                configPath = PathHelpers.modulesPath(controller.owner.project.path, configPath);
            }
        } else {
            // ex: config/relation.yaml

            configPath = configPath.split('/').join(path.sep);
            configPath = path.join(owner.path, 'controllers', controller.uqn.toLowerCase(), configPath);
        }

        if (!FsHelpers.exists(configPath)) {
            return;
        }

        const regexStr = Str.replaceAll(`${link.markedText}:\s*\r?\n`, '\\', '\\\\');
        const regex = new RegExp(regexStr, 'g');

        const configContent = FsHelpers.readFile(configPath);
        const behaviorConfig = yaml.parse(configContent);

        const matches = configContent.matchAll(regex);
        for (const match of matches) {
            const relationName = match[0].trim().slice(0, -1);
            if (!behaviorConfig[relationName]) {
                continue;
            }

            const uri = vscode.Uri.file(configPath);

            const configDocument = await vscode.workspace.openTextDocument(uri);
            const position = configDocument.positionAt(match.index!);

            link.target = uri.with({
                fragment: `L${position.line + 1},${position.character}`
            });

            return link;
        }
    }
}
