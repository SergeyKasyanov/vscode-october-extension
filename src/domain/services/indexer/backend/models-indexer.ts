import { Model } from "../../../entities/classes/model";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Models directory reader
 */
export class ModelsIndexer extends DirectoryIndexer<Model> {

    protected getOctoberClassParentsFqn(): string[] {
        return [
            'Model',
            'System\\Models\\SettingModel',
            'October\\Rain\\Database\\Model',
            'October\\Rain\\Database\\Attach\\File',
            'October\\Rain\\Auth\\Models\\User',
            'October\\Rain\\Auth\\Models\\Role',
            'October\\Rain\\Auth\\Models\\Group',
            'October\\Rain\\Auth\\Models\\Throttle',
            'October\\Rain\\Auth\\Models\\Preferences',
        ];
    }

    protected makeOctoberClass(path: string, fqn: string): Model {
        return new Model(this.owner!, path, fqn);
    }
}
