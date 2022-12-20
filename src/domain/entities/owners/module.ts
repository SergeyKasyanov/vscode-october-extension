import path = require("path");
import { Str } from "../../../helpers/str";
import { BackendOwner } from "./backend-owner";

/**
 * Represents module of opened project
 */
export class Module extends BackendOwner {
    /**
     * Path to ServiceProvider.php
     */
    get registrationFilePath(): string {
        return path.join(this.path, 'ServiceProvider.php');
    }

    /**
     * Backend menu context owner
     */
    get contextOwner(): string {
        return 'October.' + Str.ucFirst(this.name);
    }
}
