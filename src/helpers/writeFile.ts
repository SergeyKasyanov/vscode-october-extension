import * as fs from "fs";
import { dirname } from "path";

export function writeFile(path: string, content: string) {
    const targetDir = dirname(path);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(path, content);
}
