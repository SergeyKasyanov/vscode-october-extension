import path = require("path");
import { pluginsPath } from "./paths";

export function getClassFilePath(classFqn: string) {
    let parts = classFqn.split('\\');

    if (parts[0] === '') {
        parts.shift();
    }

    if (parts.length === 3 || parts.length === 4) {
        const classNameFilename = parts.pop() + '.php';
        const dirName = parts.join(path.sep).toLocaleLowerCase();

        return pluginsPath(dirName + path.sep + classNameFilename);
    }
}
