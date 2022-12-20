import path = require("path");
import * as phpParser from "php-parser";
import { MethodsList, PhpHelpers, PropertiesList } from "../../helpers/php-helpers";
import { OctoberEntity } from "../october-entity";
import { BackendOwner } from "../owners/backend-owner";

/**
 * Base class for plugin classes like controllers, models, widgets, etc...
 */
export abstract class OctoberClass extends OctoberEntity {
    /**
     * Class owner (appRir/module/plugin)
     */
    get owner(): BackendOwner {
        return this._owner as BackendOwner;
    }

    /**
     * Full class name
     */
    get fqn(): string {
        return this._name;
    }

    /**
     * Class name without namespace
     */
    get uqn(): string {
        const parts = this.name.split('\\');
        return parts[parts.length - 1];
    }

    /**
     * Php class ast
     */
    get phpClass(): phpParser.Class | undefined {
        const fileContent = this.fileContent;
        if (fileContent) {
            return PhpHelpers.getClass(fileContent, this.path);
        }
    }

    /**
     * List oh php class properties
     */
    get phpClassProperties(): PropertiesList | undefined {
        const phpClass = this.phpClass;
        if (phpClass) {
            return PhpHelpers.getProperties(phpClass);
        }
    }

    /**
     * List of php class methods
     */
    get phpClassMethods(): MethodsList | undefined {
        const phpClass = this.phpClass;
        if (phpClass) {
            return PhpHelpers.getMethods(phpClass);
        }
    }

    /**
     * Returns line and character of class in file
     * for use in document links.
     *
     * Example: L10,5
     */
    get classPosition(): string {
        const phpClass = this.phpClass;
        if (!phpClass) {
            return 'L1,1';
        }

        const line = phpClass.loc!.start.line;
        const char = phpClass.loc!.start.column;

        return `L${line},${char}`;
    }
}
