export interface Relation {
    name: string,
    type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany' | 'morphTo' | 'morphOne' | 'morphMany' | 'attachOne' | 'attachMany'
    modelFqn: string | null,
}

export interface Column {
    name: string,
    type: string,
}

export class Model {
    constructor(
        private _fqn: string,
        private _scopes: string[] = [],
        private _optionsMethods: string[] = [],
        private _relations: { [name: string]: Relation } = {},
        private _columns: { [name: string]: Column } = {},
        private _table: string | undefined
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

    public get scopes(): string[] {
        return this._scopes;
    }

    public get optionsMethods(): string[] {
        return this._optionsMethods;
    }

    public get relations(): { [name: string]: Relation } {
        return this._relations;
    }

    public get columns(): { [name: string]: Column } {
        return this._columns;
    }

    public get table(): string | undefined {
        return this._table;
    }
}
