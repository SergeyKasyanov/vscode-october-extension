import * as phpParser from 'php-parser';
import { PhpHelpers } from "../../helpers/php-helpers";
import { Owner } from "../owners/owner";
import { HasAjaxMethods } from "./concerns/has-ajax-methods";
import { OctoberClass } from "./october-class";
import path = require("path");

export interface ComponentDetails {
    name: string,
    description: string
};

export interface ComponentProperty {
    name: string,
    title?: string,
    description?: string
}

/**
 * Represents front-end component class
 */
export class Component extends OctoberClass {
    private _alias?: string;
    private _details: ComponentDetails = { name: '', description: '' };
    private _properties: ComponentProperty[] = [];

    private hasAjaxMethods: HasAjaxMethods;

    constructor(
        protected _owner: Owner,
        protected _path: string,
        protected _name: string,
    ) {
        super(_owner, _path, _name);

        this.hasAjaxMethods = new HasAjaxMethods(this);
    }

    /**
     * Directory containing components of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['components'];
    }

    /**
     * Ajax methods of this component
     */
    get ajaxMethods(): string[] {
        return this.hasAjaxMethods.ajaxMethods;
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'components', this.uqn.toLowerCase());
    }

    /**
     * Component registration alias
     */
    get defaultAlias(): string | undefined {
        if (!this.owner.registrationFileExists) {
            return this._alias;
        }

        try {
            const registrationFileContent = this.owner.registrationFileContent;
            if (!registrationFileContent) {
                return this._alias;
            }

            const phpClass = PhpHelpers.getClass(registrationFileContent, this.owner.registrationFilePath);
            if (!phpClass) {
                return this._alias;
            }

            const registerComponentsMethod = PhpHelpers.getMethods(phpClass).registerComponents;
            if (!registerComponentsMethod) {
                return this._alias;
            }

            const returnExpr = registerComponentsMethod.body?.children.find(el => el.kind === 'return') as phpParser.Return;
            if (returnExpr?.expr?.kind !== 'array') {
                return this._alias;
            }

            const currentNs = PhpHelpers.getNamespace(registrationFileContent, this.owner.registrationFilePath);

            const uses = PhpHelpers.getUsesList(registrationFileContent, this.owner.registrationFilePath);

            for (const _entry of (returnExpr.expr as phpParser.Array).items) {
                const entry = _entry as phpParser.Entry;
                const isLookup = entry.key?.kind === 'staticlookup';
                if (!isLookup) {
                    continue;
                }

                const what = ((entry.key as phpParser.StaticLookup).what as phpParser.Name);
                let _fqn: string | undefined = PhpHelpers.lookupNameToFqn(what, uses, currentNs?.name);

                if (_fqn === this.fqn) {
                    this._alias = (entry.value as phpParser.String).value;
                    break;
                }
            }
        } catch (err) {
            console.error(err);
        }

        return this._alias;
    }

    /**
     * Component details
     */
    get details(): ComponentDetails {
        if (!this.fileExists) {
            return this._details;
        }

        try {
            const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
            if (!phpClass) {
                return this._details;
            }

            const componentDetailsMethod = PhpHelpers.getMethods(phpClass).componentDetails;
            if (!componentDetailsMethod) {
                return this._details;
            }

            const returnExpr = componentDetailsMethod.body?.children.find(el => el.kind === 'return') as phpParser.Return;
            if (returnExpr?.expr?.kind !== 'array') {
                return this._details;
            }

            const returnArr = PhpHelpers.phpArrayToObject(returnExpr.expr as phpParser.Array);

            const translations = this.owner.project.translations;

            this._details.name = translations[returnArr.name] || returnArr.name;

            if (returnArr.description) {
                this._details.description = translations[returnArr.description] || returnArr.description;
            }
        } catch (err) {
            console.error(err);
        }

        return this._details;
    }

    /**
     * Component properties
     */
    get properties(): ComponentProperty[] {
        if (!this.fileExists) {
            return this._properties;
        }

        try {
            const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
            if (!phpClass) {
                return this._properties;
            }

            const definePropertiesMethod = PhpHelpers.getMethods(phpClass).defineProperties;
            if (!definePropertiesMethod) {
                return this._properties;
            }

            const returnExpr = definePropertiesMethod.body?.children.find(el => el.kind === 'return') as phpParser.Return;
            if (returnExpr?.expr?.kind !== 'array') {
                return this._properties;
            }

            const translations = this.owner.project.translations;

            const properties = [];

            const returnArr = PhpHelpers.phpArrayToObject(returnExpr.expr as phpParser.Array);
            for (const propName in returnArr) {
                if (Object.prototype.hasOwnProperty.call(returnArr, propName)) {
                    const propDetails = returnArr[propName];

                    const componentProperty: ComponentProperty = {
                        name: propName
                    };

                    if (propDetails instanceof Object) {
                        componentProperty.title = translations[propDetails.title] || propDetails.title;
                        componentProperty.description = translations[propDetails.description] || propDetails.description;
                    }

                    properties.push(componentProperty);
                }
            }

            this._properties = properties;
        } catch (err) {
            console.error(err);
        }

        return this._properties;
    }
}
