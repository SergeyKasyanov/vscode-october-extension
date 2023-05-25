import * as vscode from 'vscode';
import { FsHelpers } from "../../helpers/fs-helpers";
import { Project } from "../project";
import path = require("path");

export type EnvKeysCollection = {
    [key: string]: {
        value: string | undefined | null,
        uri: vscode.Uri
    }
};

/**
 * List of keys from .env file
 */
export function getEnv(project: Project): EnvKeysCollection {
    const envPath = path.join(project.path, '.env');
    if (!FsHelpers.exists(envPath)) {
        return {};
    }

    const uri = vscode.Uri.file(envPath);

    const envKeys: EnvKeysCollection = {};

    const envContent = FsHelpers.readFile(envPath);
    const lines = envContent.split(/\r?\n/);

    for (const line of lines) {
        if (line.trim().length === 0) {
            continue;
        }

        const parts = line.trim().split('=');
        const key = parts[0].trim();
        const value = parseValue(parts[1]);

        envKeys[key] = {
            value,
            uri: uri.with({ fragment: `L${line},0` })
        };
    }

    return envKeys;
}

function parseValue(value: string | null | undefined) {
    if (!value) {
        return undefined;
    }

    value = value.trim();

    if (value === 'null') {
        return undefined;
    }

    if (value.length === 0) {
        return undefined;
    }

    return value;
}
