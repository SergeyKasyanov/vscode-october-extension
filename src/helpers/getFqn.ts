import * as fs from "fs";

export function getFqn(filepath: string) {
    const content = fs.readFileSync(filepath).toString();
    const lines = content.split(/\r?\n/);

    let namespace, className;

    for (const lineText of lines) {
        if (namespace && className) {
            break;
        }

        if (!namespace && lineText.includes('namespace')) {
            namespace = lineText.split('namespace')[1].split(';')[0].trim();
            continue;
        }

        if (!className && lineText.includes('class')) {
            className = lineText.split('class')[1].split('extends')[0].trim();
            break;
        }
    }

    if (!namespace || !className) {
        return;
    }

    return `\\${namespace}\\${className}`;
}
