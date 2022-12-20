import { ControllerBehavior, ModelBehavior } from "../../../entities/classes/behavior";
import { DirectoryIndexer } from './directory-indexer';

/**
 * Controller behaviors directory reader
 */
export class ControllerBehaviorsIndexer extends DirectoryIndexer<ControllerBehavior> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Backend\\Classes\\ControllerBehavior'];
    }

    protected makeOctoberClass(path: string, fqn: string): ControllerBehavior {
        return new ControllerBehavior(this.owner!, path, fqn);
    }
}

/**
 * Model behaviors directory reader
 */
export class ModelBehaviorsIndexer extends DirectoryIndexer<ModelBehavior> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['System\\Classes\\ModelBehavior'];
    }

    protected makeOctoberClass(path: string, fqn: string): ModelBehavior {
        return new ModelBehavior(this.owner!, path, fqn);
    }
}
