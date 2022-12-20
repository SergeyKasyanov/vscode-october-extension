import { Command } from "../../../entities/classes/command";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Artisan commands directory reader
 */
export class CommandsIndexer extends DirectoryIndexer<Command> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Illuminate\\Console\\Command'];
    }

    protected makeOctoberClass(path: string, fqn: string): Command {
        return new Command(this.owner!, path, fqn);
    }
}
