import { Model } from "../../../entities/classes/model";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Models directory reader
 */
export class ModelsIndexer extends DirectoryIndexer<Model> {

    protected getOctoberClassParentsFqn(): string[] {
        return [
            'Model',
            'October\\Rain\\Database\\Model',
            'October\\Rain\\Auth\\Models\\User'
        ];
    }

    protected makeOctoberClass(path: string, fqn: string): Model {
        return new Model(this.owner!, path, fqn);
    }
}
