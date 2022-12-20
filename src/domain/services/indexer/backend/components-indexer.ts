import { Component } from "../../../entities/classes/component";
import { Owner } from "../../../entities/owners/owner";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Front-end components directory reader
 */
export class ComponentsIndexer extends DirectoryIndexer<Component> {

    protected getOctoberClassParentsFqn(): string[] {
        return [
            'Cms\\Classes\\ComponentBase',
            'Cms\\Classes\\ComponentModuleBase'
        ];
    }

    protected makeOctoberClass(path: string, fqn: string): Component {
        return new Component(this.owner!, path, fqn);
    }
}
