import { Model } from "../../../entities/classes/model";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Models directory reader
 */
export class ModelsIndexer extends DirectoryIndexer<Model> {

    protected getOctoberClassParentsFqn(): string[] {
        return [
            'Model',
            'October\\Rain\\Auth\\Models\\Group',
            'October\\Rain\\Auth\\Models\\Preferences',
            'October\\Rain\\Auth\\Models\\Role',
            'October\\Rain\\Auth\\Models\\Throttle',
            'October\\Rain\\Auth\\Models\\User',
            'October\\Rain\\Database\\Attach\\File',
            'October\\Rain\\Database\\ExpandoModel',
            'October\\Rain\\Database\\Model',
            'October\\Rain\\Database\\Pivot',
            'System\\Models\\SettingModel',
            'Tailor\\Classes\\BlueprintModel',
        ];
    }

    protected makeOctoberClass(path: string, fqn: string): Model {
        return new Model(this.owner!, path, fqn);
    }
}
