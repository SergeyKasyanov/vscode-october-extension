import { Controller } from "../../../entities/classes/controller";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Backend controllers directory reader
 */
export class ControllersIndexer extends DirectoryIndexer<Controller> {

    protected getOctoberClassParentsFqn(): string[] {
        return [
            'Backend\\Classes\\Controller',
            'Backend\\Classes\\WildcardController',
            'Backend\\Classes\\SettingsController'
        ];
    }

    protected makeOctoberClass(path: string, fqn: string): Controller {
        return new Controller(this.owner!, path, fqn);
    }
}
