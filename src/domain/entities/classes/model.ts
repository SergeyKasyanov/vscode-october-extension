import * as phpParser from 'php-parser';
import { Str } from '../../../helpers/str';
import { MethodsList, PhpHelpers } from "../../helpers/php-helpers";
import { Owner } from '../owners/owner';
import { ModelBehavior } from './behavior';
import { BehaviorsList, HasBehaviors } from './concerns/has-behaviors';
import { OctoberClass } from "./october-class";
import path = require('path');

export type TraitsList = {
    traitFqn: string;
    location: phpParser.Location;
}[];

/**
 * Represents model class in plugin, module or app
 */
export class Model extends OctoberClass {

    private hasBehaviors: HasBehaviors;

    private _table: string = '';
    private _attributes: string[] = [];
    private _relations: { [name: string]: Model } = {};

    constructor(
        protected _owner: Owner,
        protected _path: string,
        protected _name: string,
    ) {
        super(_owner, _path, _name);

        this.hasBehaviors = new HasBehaviors(this);
    }

    /**
     * Directory containing models of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['models'];
    }

    /**
     * Used behaviors
     */
    get behaviors(): BehaviorsList<ModelBehavior> {
        return this.hasBehaviors.behaviors as BehaviorsList<ModelBehavior>;
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'models', this.uqn.toLowerCase());
    }

    /**
     * Database table used by this model
     */
    get table(): string {
        const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
        if (!phpClass) {
            this._table = '';
            return this._table;
        }

        const tableProp = PhpHelpers.getProperties(phpClass).table;
        if (tableProp?.value?.kind === 'string') {
            this._table = (tableProp.value as phpParser.String).value;
        } else {
            this._table = Str.plural(PhpHelpers.identifierToString(phpClass.name).toLowerCase());
        }

        return this._table;
    }

    /**
     * Model attributes described in docblock
     */
    get attributes(): string[] {
        const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
        if (!phpClass) {
            this._attributes = [];
            return this._attributes;
        }

        const attributes = phpClass.leadingComments?.flatMap(
            c => PhpHelpers.getPropertiesFromDocBlock(c)
        ) || [];

        this._attributes = [...new Set(attributes)].sort();

        return this._attributes;
    }

    /**
     * Guess models attributes from $fillable and $guarded properties
     */
    get guessAttributes() {
        const attributes = [];

        const properties = this.phpClassProperties;
        const attrProperties = [properties?.guarded, properties?.fillable];

        for (const prop of attrProperties) {
            if (!prop || prop.value?.kind !== 'array') {
                continue;
            }

            const values = PhpHelpers.phpArrayToObject(prop.value as phpParser.Array);

            for (const field in values) {
                if (Object.prototype.hasOwnProperty.call(values, field)) {
                    const val = values[field];

                    if (typeof val !== 'string' || val === '*' || val === '') {
                        continue;
                    }

                    attributes.push(val);
                }
            }
        }

        const methods = this.phpClassMethods || {};
        for (const name of Object.keys(methods)) {
            if ((name.startsWith('get') || name.startsWith('set')) && name.endsWith('Attribute')) {
                const guessedAttr = name.substring(3, name.length - 9);

                attributes.push(Str.snakeCase(guessedAttr));
            }
        }

        return attributes;
    }

    /**
     * List of model relations
     */
    get relations(): { [name: string]: Model } {
        const ns = PhpHelpers.getNamespace(this.fileContent!, this.path);
        if (!ns) {
            this._relations = {};
            return {};
        }

        const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
        if (!phpClass) {
            this._relations = {};
            return {};
        }

        try {
            const relations: { [name: string]: Model } = {};

            const uses = PhpHelpers.getUsesList(this.fileContent!, this.path);

            const classProperties = PhpHelpers.getProperties(phpClass);

            const relationTypes = [
                'belongsTo',
                'hasOne',
                'hasMany',
                'belongsToMany',
                'hasManyThrough',
                'hasOneThrough',
                'morphOne',
                'morphMany',
                'morphTo',
                'attachOne',
                'attachMany'
            ];

            for (const type of relationTypes) {
                const definition = classProperties[type];
                if (!definition || definition.value?.kind !== 'array') {
                    continue;
                }

                (definition.value as phpParser.Array).items.forEach(_item => {
                    const item = (_item as phpParser.Entry);
                    const name = (item.key as phpParser.String).value;

                    let fqn: string | undefined;

                    switch (item.value.kind) {
                        case 'staticlookup':
                            const what = ((item.value as phpParser.StaticLookup).what as phpParser.Name);

                            fqn = PhpHelpers.lookupNameToFqn(what, uses);
                            if (!fqn && what.resolution === 'uqn' && !uses[what.name]) {
                                fqn = ns.name + '\\' + what.name;
                            }
                            break;
                        case 'string':
                            const modelName = (item.value as phpParser.String).value;
                            if (modelName.includes('\\')) {
                                fqn = modelName;
                            } else {
                                fqn = ns.name + '\\' + modelName;
                            }
                            break;
                        case 'array':
                            const firstEntry = (item.value as phpParser.Array).items[0] as phpParser.Entry;

                            if (firstEntry.value.kind === 'string') {
                                const modelName = (firstEntry.value as phpParser.String).value;
                                if (modelName.includes('\\')) {
                                    fqn = modelName;
                                } else {
                                    fqn = ns.name + '\\' + modelName;
                                }
                            } else if (firstEntry.value.kind === 'staticlookup') {
                                const what = (firstEntry.value as phpParser.StaticLookup).what as phpParser.Name;
                                fqn = PhpHelpers.lookupNameToFqn(what, uses);
                                if (!fqn && what.resolution === 'uqn' && !uses[what.name]) {
                                    fqn = ns.name + '\\' + what.name;
                                }
                            }
                            break;
                    }

                    if (!fqn) {
                        return;
                    }

                    const model = this.owner.models.find(m => m.fqn === fqn);
                    if (!model) {
                        return;
                    }

                    relations[name] = model;
                });
            }

            this._relations = relations;
        } catch (err) {
            console.error(err);
        }

        return this._relations;
    }

    /**
     * Get list of traits used in model
     * with its locations
     */
    get traits(): TraitsList {
        const fileContent = this.fileContent;
        if (!fileContent) {
            return [];
        }

        const traits: TraitsList = [];

        const phpClass = this.phpClass;
        if (!phpClass) {
            return [];
        }

        const uses = PhpHelpers.getUsesList(fileContent, this.path);

        for (const el of phpClass.body) {
            if (el.kind !== 'traituse') {
                continue;
            }

            const usedTraits = (el as unknown as phpParser.TraitUse).traits as phpParser.Name[];
            for (const trait of usedTraits) {
                const traitFqn = PhpHelpers.lookupNameToFqn(trait, uses);
                if (!traitFqn) {
                    continue;
                }

                traits.push({
                    traitFqn,
                    location: el.loc!
                });
            }
        }

        return traits;
    }

    /**
     * List of public methods starts wth "get" and ends with "Options"
     */
    get optionsMethods(): MethodsList {
        const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
        if (!phpClass) {
            return {};
        }

        const optionsMethods: MethodsList = {};

        const classMethods = PhpHelpers.getMethods(phpClass);
        for (const methodName in classMethods) {
            if (Object.prototype.hasOwnProperty.call(classMethods, methodName)) {
                const method = classMethods[methodName];

                if (method.visibility === 'public'
                    && methodName.startsWith('get')
                    && methodName.includes('Options')
                ) {
                    optionsMethods[methodName] = method;
                }
            }
        }

        return optionsMethods;
    }

    /**
     * List of scopes defined in model with ranges
     */
    get scopes(): MethodsList {
        const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
        if (!phpClass) {
            return {};
        }

        const optionsMethods: MethodsList = {};

        const classMethods = PhpHelpers.getMethods(phpClass);
        for (const methodName in classMethods) {
            if (Object.prototype.hasOwnProperty.call(classMethods, methodName)) {
                const method = classMethods[methodName];

                if (method.visibility === 'public'
                    && methodName.startsWith('scope')
                ) {
                    const scopeName = Str.lcFirst(methodName.substring('scope'.length));

                    optionsMethods[scopeName] = method;
                }
            }
        }

        return optionsMethods;
    }

    /**
     * Guess corresponding controller
     */
    get controller() {
        const name = Str.plural(this.uqn);
        const fqnParts = this.fqn.split('\\');

        let fqn: string;
        const vendor = fqnParts.shift();
        if (vendor === 'App') {
            fqn = [vendor, 'Controllers', name].join('\\');
        } else {
            fqn = [vendor, fqnParts.shift(), 'Controllers', name].join('\\');
        }

        return this.owner.project.controllers.find(c => c.fqn === fqn);
    }
}
