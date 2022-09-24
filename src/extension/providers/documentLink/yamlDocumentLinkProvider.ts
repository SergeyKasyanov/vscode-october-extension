import * as fs from "fs";
import * as vscode from "vscode";
import { pluginsPath, rootPath } from "../../../helpers/paths";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { YamlFileUtils } from "../../../helpers/yamlFileUtils";
import path = require("path");
import pluralize = require("pluralize");
import { Platform } from "../../../services/platform";

const PATH_KEYS = [
    'path',
    'toolbarPartial',
    'buttons',
    'form',
    'list',
    'groups',
    'filter',
];

export class YamlDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private document: vscode.TextDocument | undefined;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.document = document;

        let links: vscode.DocumentLink[] = [];

        let line = 0;
        while (line < document.lineCount) {
            const link = this.getLink(line);

            if (link) {
                links.push(
                    new vscode.DocumentLink(
                        new vscode.Range(new vscode.Position(line, link.start), new vscode.Position(line, link.end)),
                        vscode.Uri.file(link.filePath)
                    )
                );
            }

            line++;
        }

        return links;
    }

    private getLink(line: number): { filePath: string; start: number; end: number; } | undefined {
        const keyVal = YamlFileUtils.getKeyAndValue(this.document!, line);

        if (!keyVal.value) {
            return;
        }

        if (PATH_KEYS.includes(keyVal.key)) {
            return this.getPathLink(line, keyVal.value);
        }

        if (keyVal.key === 'modelClass') {
            return this.getModelLink(line, keyVal.value);
        }
    }

    private getModelLink(line: number, modelFqn: string): { filePath: string; start: number; end: number; } | undefined {

        let fqnParts = modelFqn.split('\\');
        if (fqnParts[0] === '') {
            fqnParts.shift();
        }

        let filePath;

        if (fqnParts.length === 3) {
            const module = fqnParts.shift()!.toLowerCase();
            const dir = fqnParts.shift()!.toLowerCase();
            const className = fqnParts.shift();
            filePath = rootPath(['modules', module, dir, className + '.php'].join(path.sep));
        } else if (fqnParts.length === 4) {
            const vendor = fqnParts.shift()!.toLowerCase();
            const plugin = fqnParts.shift()!.toLowerCase();
            const dir = fqnParts.shift()!.toLowerCase();
            const className = fqnParts.shift();
            filePath = pluginsPath([vendor, plugin, dir, className + '.php'].join(path.sep));
        } else {
            return;
        }

        if (!fs.existsSync(filePath)) {
            return;
        }

        const start = this.document!.lineAt(line).text.indexOf(modelFqn);
        const end = start + modelFqn.length;

        return {
            filePath,
            start,
            end
        };
    }

    private getPathLink(line: number, valuePath: string) {
        let filePath: string | undefined;

        if (valuePath.startsWith('$')) {
            filePath = pluginsPath(valuePath.slice(1).replace('/', path.sep));
            if (!fs.existsSync(filePath)) {
                return;
            }
        } else if (valuePath.startsWith('~')) {
            filePath = rootPath(valuePath.slice(1).replace('/', path.sep));
            if (!fs.existsSync(filePath)) {
                return;
            }
        } else {
            const parsed = PluginFileUtils.parseFileName(this.document!.fileName);
            if (!parsed) {
                return;
            }

            let controller;
            if (parsed.directory === 'models') {
                controller = pluralize.plural(parsed.classNameWithoutExt).toLowerCase();
            } else if (parsed.directory === 'controllers') {
                controller = parsed.classNameWithoutExt.toLowerCase();
            } else {
                return;
            }

            filePath = pluginsPath([parsed.vendor, parsed.plugin, 'controllers', controller].join(path.sep));

            if (!fs.existsSync(filePath)) {
                return;
            }

            let pathParts = valuePath.split('/');
            let lastPart = pathParts.pop();

            if (!lastPart) {
                return;
            }

            if (lastPart.endsWith('.yaml')) {
                filePath += path.sep + pathParts.join(path.sep) + path.sep + lastPart;
            } else {
                lastPart = '_' + lastPart;

                filePath += path.sep + pathParts.join(path.sep) + path.sep + lastPart;

                let found = false;

                for (const ext of Platform.getInstance().getBackendViewExtensions()) {
                    if (fs.existsSync(filePath + '.' + ext)) {
                        found = true;
                        filePath += '.' + ext;
                        break;
                    }
                }

                if (!found) {
                    return;
                }
            }
        }

        if (!filePath) {
            return;
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return;
        }

        const start = this.document!.lineAt(line).text.indexOf(valuePath);
        const end = start + valuePath.length;

        return {
            filePath,
            start,
            end
        };
    }
}
