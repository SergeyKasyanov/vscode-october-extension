import { Behavior } from "../classes/plugin/behavior";
import { Owner } from "./owner";

/**
 * Represents app ("the project level plugin") of opened project
 */
export class AppDirectory extends Owner {
    behaviors: Behavior[] = [];
}
