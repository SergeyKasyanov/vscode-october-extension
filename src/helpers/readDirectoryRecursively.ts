import * as fs from "fs";
import path = require("path");

export function readDirectoryRecursively({ dir, prefix = '', exts = [] }: { dir: string; prefix?: string; exts?: string[] }): string[] {
    let files: string[] = [];

    fs.readdirSync(dir, { withFileTypes: true })
        .forEach(entry => {
            if (entry.isDirectory()) {
                files.push(...readDirectoryRecursively({
                    dir: dir + path.sep + entry.name,
                    prefix: prefix + entry.name + path.sep,
                    exts
                }));
            } else {
                let matched = false;

                if (exts) {
                    for (const ext of exts) {
                        if (entry.name.endsWith(ext)) {
                            matched = true;
                            break;
                        }
                    }
                } else {
                    matched = true;
                }

                if (matched) {
                    files.push(prefix + entry.name);
                }
            }
        });

    return files;
}
