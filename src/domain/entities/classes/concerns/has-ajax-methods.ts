import { PhpHelpers } from "../../../helpers/php-helpers";
import { OctoberClass } from "../october-class";

const SKIP_METHODS = [
    'onInit',
    'onStart',
    'onBeforePageStart',
    'onEnd',
    'onRun'
];

/**
 * Lists ajax methods declared in controllers, widgets, components or behaviors
 */
export class HasAjaxMethods {

    private _ajaxMethods: string[] = [];

    constructor(
        private ocClass: OctoberClass
    ) { }

    /**
     * Ajax methods of october class (public methods with name stats with "on")
     */
    get ajaxMethods(): string[] {
        const fileContent = this.ocClass.fileContent;
        if (!fileContent) {
            return this._ajaxMethods;
        }

        const phpClass = PhpHelpers.getClass(fileContent, this.ocClass.path);
        if (!phpClass) {
            return this._ajaxMethods;
        }

        try {
            const classMethods = PhpHelpers.getMethods(phpClass);

            const ajaxMethods: string[] = [];

            for (const methodName in classMethods) {
                if (Object.prototype.hasOwnProperty.call(classMethods, methodName)) {
                    const method = classMethods[methodName];

                    if (SKIP_METHODS.includes(methodName)) {
                        continue;
                    }

                    if (method.visibility !== 'public') {
                        continue;
                    }

                    if (methodName.startsWith('on')) {
                        ajaxMethods.push(methodName);
                    }

                    if (methodName.includes('_on')) {
                        ajaxMethods.push('on' + methodName.split('_on', 2)[1]);
                    }
                }
            }

            this._ajaxMethods = ajaxMethods;
        } catch (err) {
            console.error(err);
        }

        return this._ajaxMethods;
    }
}
