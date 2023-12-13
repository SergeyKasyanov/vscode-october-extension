import * as fs from "fs";
import path = require("path");
import { Config } from "../../config";

export class FsHelpers {
    /**
     * List files in directory
     *
     * @param root
     * @param recursively
     * @param exts
     * @param _subdirectory
     * @returns
     */
    static listFiles(
        root: string,
        recursively: boolean = false,
        exts: string[] = [],
        _subdirectory: string = ''
    ): string[] {
        let files: string[] = [];

        const excludes = Config.excludeFromIndex;

        fs.readdirSync(path.join(root, _subdirectory), { withFileTypes: true })
            .forEach(entry => {
                if (entry.isDirectory() && !excludes.includes(entry.name)) {
                    if (recursively) {
                        files.push(...this.listFiles(
                            root,
                            recursively,
                            exts,
                            path.join(_subdirectory, entry.name)
                        ));
                    }
                } else {
                    files.push(path.join(_subdirectory, entry.name));
                }
            });

        if (exts.length > 0) {
            files = files.filter(file => {
                let matched: boolean = false;

                for (const ext of exts) {
                    if (file.endsWith(ext)) {
                        matched = true;
                        break;
                    }
                }

                return matched;
            });
        }

        return files.sort();
    }

    /**
     * List subdirectories in directory
     *
     * @param root
     * @param recursively
     * @param subdirectory
     * @returns
     */
    static listDirectories(
        root: string,
        recursively: boolean = false,
        subdirectory: string = ''
    ): string[] {
        const directories: string[] = [];

        fs.readdirSync(path.join(root, subdirectory), { withFileTypes: true })
            .forEach(entry => {
                if (entry.isDirectory()) {
                    if (recursively) {
                        directories.push(...this.listDirectories(
                            root,
                            recursively,
                            path.join(subdirectory, entry.name)
                        ));
                    } else {
                        directories.push(path.join(subdirectory, entry.name));
                    }
                }
            });

        return directories.sort();
    }

    /**
     * Is file or directory exists
     *
     * @param filePath
     * @returns
     */
    static exists(filePath: string) {
        return fs.existsSync(filePath);
    }

    /**
     * Check if given path is file
     *
     * @param filePath
     * @returns
     */
    static isFile(filePath: string): boolean {
        return fs.lstatSync(filePath).isFile();
    }

    /**
     * Check if given path is directory
     *
     * @param dirPath
     * @returns
     */
    static isDirectory(dirPath: string): boolean {
        return fs.lstatSync(dirPath).isDirectory();
    }

    /**
     * Get file content as string
     *
     * @param path
     * @returns
     */
    static readFile(filePath: string) {
        return fs.readFileSync(filePath).toString();
    }

    /**
     * Write file
     *
     * @param filePath
     * @param content
     */
    static writeFile(filePath: string, content: string) {
        const targetDir = path.dirname(filePath);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(filePath, content);
    }
}
