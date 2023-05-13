import { OctoberClass } from "../../../entities/classes/october-class";
import { Owner } from "../../../entities/owners/owner";
import { FsHelpers } from '../../../helpers/fs-helpers';
import { PhpHelpers } from '../../../helpers/php-helpers';
import path = require('path');

/**
 * Base class for all backend directory indexers
 */
export abstract class DirectoryIndexer<T extends OctoberClass> {

    protected owner: Owner | undefined;

    /**
     * Scan directory for classes
     *
     * @param owner
     * @param directory
     */
    index(owner: Owner, directory: string): T[] {
        this.owner = owner;

        return FsHelpers.listFiles(directory).reduce((acc: T[], filename: string) => {
            if (!filename.endsWith('.php')) {
                return acc;
            }

            const ocClass = this.loadOctoberClass(path.join(directory, filename));
            if (ocClass) {
                acc.push(ocClass);
            }

            return acc;
        }, []);
    }

    /**
     * Index single class
     *
     * @param owner
     * @param filePath
     * @returns
     */
    indexFile(owner: Owner, filePath: string): T | undefined {
        this.owner = owner;

        const ocClass = this.loadOctoberClass(filePath);
        if (ocClass) {
            return ocClass;
        }
    }

    /**
     * Load OctoberClass from file
     *
     * @param filePath
     * @returns
     */
    protected loadOctoberClass(filePath: string): T | undefined {
        const content = FsHelpers.readFile(filePath);
        if (!content.length) {
            return;
        }

        let phpClass = PhpHelpers.getClass(content, filePath)
            || PhpHelpers.getReturnNewClass(content, filePath);
        if (!phpClass || !phpClass.extends) {
            return;
        }

        const uses = PhpHelpers.getUsesList(content, filePath);
        const parentFqn = uses[phpClass.extends.name] || phpClass.extends.name;
        const ns = PhpHelpers.getNamespace(content, filePath);

        // filename as name is for anonymous migrations
        const name = phpClass.name
            ? PhpHelpers.identifierToString(phpClass.name)
            : filePath.split(path.sep).pop()!.split('.').shift();

        // migrations may be without namespaces
        const fqn = (ns ? ns.name + '\\' : '') + name;

        if (!this.getOctoberClassParentsFqn().includes(parentFqn)) {
            return;
        }

        return this.makeOctoberClass(filePath, fqn);
    }

    /**
     * Returns possible parents of current loading class
     */
    protected abstract getOctoberClassParentsFqn(): string[];

    /**
     * Make instance of OctoberClass
     *
     * @param path
     * @param fqn
     * @returns
     */
    protected abstract makeOctoberClass(path: string, fqn: string): T;
}
