import { Behavior } from "../classes/plugin/behavior";
import { Owner } from "./owner";

/**
 * Represents module of opened project
 */
export class Module extends Owner {
    behaviors: Behavior[] = [];
}
