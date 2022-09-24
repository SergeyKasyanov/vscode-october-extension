import * as cp from 'child_process';
import * as os from 'os';
import { getPhpPath } from '../config';
import { rootPath } from './paths';

export function exec(cmd: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                console.error(err);
                console.error(out);

                return reject(err);
            }
            return resolve(out);
        });
    });
}

export async function execPhpInProject(code: string) {
    let phpCode = `require '${rootPath("bootstrap/autoload.php")}';
        (require_once '${rootPath("bootstrap/app.php")}')
            ->make(\\Illuminate\\Contracts\\Console\\Kernel::class)
            ->bootstrap();
    `;

    phpCode += code;

    return await execPhp(phpCode);
}

export async function execPhp(code: string): Promise<string> {
    code = code
        .replace(/\s+/g, ' ')
        .replace(/\"/g, "\\\"");

    const platform = os.platform();
    const isUnix = platform.includes('linux') || platform.includes('darwin');

    if (isUnix) {
        code = code
            .replace(/\$/g, "\\$")
            .replace(/\\\\'/g, '\\\\\\\\\'')
            .replace(/\\\\"/g, '\\\\\\\\\"');
    }

    const php = getPhpPath();
    const cmd = `${php} -r "${code}"`;

    return await exec(cmd);
}

export async function execArtisan(command: string): Promise<string> {
    const php = getPhpPath();
    const path = rootPath();

    const cmd = `cd ${path} && ${php} artisan ${command}`;

    return await exec(cmd);
}
