import * as phpParser from 'php-parser';
import { PhpHelpers } from "../../../helpers/php-helpers";
import { Behavior } from "../behavior";
import { OctoberClass } from "../october-class";

export type BehaviorsList<T extends Behavior> = {
    [name: string]: {
        behavior: T;
        location: phpParser.Location;
    };
};

export class HasBehaviors {

    private _behaviors: BehaviorsList<Behavior> = {};

    constructor(
        private ocClass: OctoberClass
    ) { }

    /**
     * Used behaviors
     */
    get behaviors(): BehaviorsList<Behavior> {
        const fileContent = this.ocClass.fileContent;
        if (!fileContent) {
            this._behaviors = {};
            return this._behaviors;
        }

        const ns = PhpHelpers.getNamespace(this.ocClass.fileContent!, this.ocClass.path);
        if (!ns) {
            this._behaviors = {};
            return this._behaviors;
        }

        const phpClass = PhpHelpers.getClass(fileContent, this.ocClass.path);
        if (!phpClass) {
            this._behaviors = {};
            return this._behaviors;
        }

        try {
            const implement = PhpHelpers.getProperties(phpClass).implement;
            if (implement?.value?.kind === 'array') {
                const behaviors: BehaviorsList<Behavior> = {};

                const uses = PhpHelpers.getUsesList(this.ocClass.fileContent!, this.ocClass.path);

                (implement.value as phpParser.Array).items.forEach(_item => {
                    if (!_item) {
                        return;
                    }

                    const item = _item as phpParser.Entry;

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
                            const behName = (item.value as phpParser.String).value;
                            if (behName.includes('.')) {
                                fqn = behName.split('.').join('\\');
                            } else if (behName.includes('\\')) {
                                fqn = behName;
                            }
                            break;
                    }

                    if (!fqn) {
                        return;
                    }

                    const behavior = this.ocClass.owner.project.controllerBehaviors.find(cb => cb.fqn === fqn)
                        || this.ocClass.owner.project.modelBehaviors.find(mb => mb.fqn === fqn);

                    if (behavior instanceof Behavior) {
                        behaviors[behavior.fqn] = {
                            behavior,
                            location: item.loc!
                        };
                    }
                });

                this._behaviors = behaviors;
            } else {
                this._behaviors = {};
            }
        } catch (err) {
            console.error(err);
        }

        return this._behaviors;
    }
}
