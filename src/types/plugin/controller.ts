export type ConfigDefinition = {
    path: string;
    realPath?: string;
    config?: any;
};

export class Controller {
    constructor(
        private _fqn: string,
        private _behaviors: {
            [name: string]: {
                [definition: string]: ConfigDefinition
            }
        } = {}
    ) { }

    public get fqn(): string {
        return this._fqn;
    }

    public get name(): string {
        let parts = this._fqn.split('\\');
        if (parts[0] === '') {
            parts.shift();
        }

        return parts[3];
    }

    public get plugin(): string {
        let parts = this._fqn.split('\\');
        if (parts[0] === '') {
            parts.shift();
        }

        return parts[0] + '.' + parts[1];
    }

    public get behaviors() {
        return this._behaviors;
    }
}
