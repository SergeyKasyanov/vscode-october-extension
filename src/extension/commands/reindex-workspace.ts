import { Indexer } from "../../domain/services/indexer";

/**
 * Stop indexer and start again
 */
export function reindexWorkspace() {
    Indexer.instance.stop();
    Indexer.instance.start();
}
