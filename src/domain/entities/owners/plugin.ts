import { Behavior } from "../classes/plugin/behavior";
import { Owner } from "./owner";

/**
 * Represents plugin of opened project
 */
export class Plugin extends Owner {
    behaviors: Behavior[] = [];
}
