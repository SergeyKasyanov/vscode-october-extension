import * as fs from "fs";
import * as vscode from "vscode";
import { pluginsDirectory, themesDirectory } from "../config";
import { Platform } from "../services/platform";
import { PluginFileUtils } from "./pluginFileUtils";
import path = require("path");
import pluralize = require("pluralize");

export function rootPath(location: string = ''): string {
    if (vscode.workspace.workspaceFolders?.length) {
        let result = vscode.workspace.workspaceFolders[0].uri.fsPath;

        if (location.length > 0) {
            result += path.sep + location;
        }

        return result;
    }

    throw new Error("Empty workspace");
}

export function pluginsPath(location: string = ''): string {
    let result = rootPath(pluginsDirectory());

    if (location.length > 0) {
        result += path.sep + location;
    }

    return result;
}

export function themesPath(location: string = '') {
    let result = rootPath(themesDirectory());

    if (location.length > 0) {
        result += path.sep + location;
    }

    return result;
}

export function relativePath(location: string, fileWithDeclarationPath: string, awaitsPartialName = false) {
    if (location.startsWith('$')) {
        return pluginsPath(location.slice(1).replace('/', path.sep));
    } else if (location.startsWith('~')) {
        return rootPath(location.slice(1).replace('/', path.sep));
    } else if (location.startsWith('/')) {
        return location;
    }

    const parsed = PluginFileUtils.parseFileName(fileWithDeclarationPath);
    if (!parsed) {
        return;
    }

    let controller,
        filePath;
    if (parsed.directory === 'models') {
        controller = pluralize.plural(parsed.classNameWithoutExt).toLowerCase();
        filePath = pluginsPath([parsed.vendor, parsed.plugin, 'controllers', controller].join(path.sep));
    } else if (parsed.directory === 'controllers') {
        controller = parsed.classNameWithoutExt.toLowerCase();
        filePath = pluginsPath([parsed.vendor, parsed.plugin, 'controllers', controller].join(path.sep));
    } else {
        filePath = pluginsPath([parsed.vendor, parsed.plugin, parsed.directory, parsed.classNameWithoutExt.toLowerCase(), 'partials'].join(path.sep));
    }

    if (!fs.existsSync(filePath)) {
        return;
    }

    if (awaitsPartialName) {
        let pathParts = location.split('/');
        let lastPart = pathParts.pop();

        if (!lastPart) {
            return;
        }

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
    } else {
        filePath += path.sep + location;
    }

    return filePath;
}
