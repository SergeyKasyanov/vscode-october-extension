import path = require("path");
import { pluginsPath } from "./paths";

export interface ParsedPluginFileName {
    vendor: string | undefined;
    plugin: string | undefined;
    directory: string | undefined;
    className: string | undefined;
    classNameWithoutExt: string;
    suffix: string;
    pluginCode: string;
}

export class PluginFileUtils {
    public static parseFileName(fileName: string): ParsedPluginFileName | undefined {
        let fileNameParts = fileName.replace(pluginsPath(), '').split(path.sep);
        if (fileNameParts[0] === '') {
            fileNameParts.shift();
        }

        if (fileNameParts.length < 4) {
            return;
        }

        const vendor = fileNameParts.shift();
        const plugin = fileNameParts.shift();
        const directory = fileNameParts.shift();
        const className = fileNameParts.shift();

        return {
            vendor,
            plugin,
            directory,
            className,
            classNameWithoutExt: className!.endsWith('.php') ? className!.slice(0, -4) : className!,
            suffix: fileNameParts.join('/'),
            pluginCode: vendor + '.' + plugin
        };
    }

    public static parseFqn(fqn: string) {
        let fileNameParts = fqn.split('\\');
        if (fileNameParts[0] === '') {
            fileNameParts.shift();
        }

        if (fileNameParts.length < 4) {
            return;
        }

        const vendor = fileNameParts.shift()!.toLowerCase();
        const plugin = fileNameParts.shift()!.toLowerCase();
        const directory = fileNameParts.shift()!.toLowerCase();
        const className = fileNameParts.shift();

        return {
            vendor,
            plugin,
            directory,
            className,
            pluginCode: vendor + '.' + plugin
        };
    }
}
