import path = require("path");
import { pluginsPath, rootPath } from "../../helpers/paths";

export interface ComponentProperty {
    name: string,
    title: string,
    description: string
}

export interface ComponentData {
    className: string,
    name: string,
    description: string | null,
    plugin: string,
    props: {
        [name: string]: ComponentProperty
    },
    ajaxMethods: string[]
}

export class Component {
    constructor(
        private _name: string,
        private _componentData: ComponentData
    ) {
    }

    public get ownerType(): 'Plugin' | 'Module' {
        return this._componentData.plugin.includes('.')
            ? 'Plugin'
            : 'Module';
    }

    public get name(): string {
        return this._name;
    }

    public get data(): ComponentData {
        return this._componentData;
    }

    public get filepath(): string {
        const parts = this._componentData.className.split('\\');
        const className = parts.pop();
        const filepath = (parts.join(path.sep).toLowerCase()) + path.sep + className + '.php';

        if (this.ownerType === 'Plugin') {
            return pluginsPath(filepath);
        } else {
            return rootPath('modules' + path.sep + filepath);
        }
    }
}
