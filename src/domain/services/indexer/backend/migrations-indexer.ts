import * as phpParser from 'php-parser';
import { Migration } from "../../../entities/classes/migration";
import { FsHelpers } from '../../../helpers/fs-helpers';
import { PhpHelpers } from '../../../helpers/php-helpers';
import { DirectoryIndexer } from "./directory-indexer";
import path = require('path');

/**
 * Migrations directory reader
 */
export class MigrationsIndexer extends DirectoryIndexer<Migration> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['October\\Rain\\Database\\Updates\\Migration'];
    }

    protected makeOctoberClass(path: string, fqn: string): Migration {
        return new Migration(this.owner!, path, fqn);
    }

    protected loadOctoberClass(filePath: string): Migration | undefined {
        const migration = super.loadOctoberClass(filePath);
        if (migration) {
            return migration;
        }

        // migrations may be written as anonymous classes

        const content = FsHelpers.readFile(filePath);
        if (!content.length) {
            return;
        }

        const ast = PhpHelpers.getAst(content, filePath);
        if (!ast) {
            return;
        }

        const returnExpr = ast.children.find(obj => obj.kind === 'return') as phpParser.Return;
        if (returnExpr?.expr?.kind !== 'new' || (returnExpr.expr as phpParser.New).what.kind !== 'class') {
            return;
        }

        const uses = PhpHelpers.getUsesList(content, filePath);
        const parent = ((returnExpr.expr as phpParser.New).what as phpParser.Class).extends;
        if (!parent) {
            return;
        }

        const parentFqn = uses[parent.name] || parent.name;
        if (!this.getOctoberClassParentsFqn().includes(parentFqn)) {
            return;
        }

        const pathParts = filePath.split(path.sep);
        const fileName = pathParts[pathParts.length - 1];
        const fqn = fileName.substring(0, fileName.length - 4);

        return this.makeOctoberClass(filePath, fqn);
    }
}
