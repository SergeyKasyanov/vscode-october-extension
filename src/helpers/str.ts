import * as pluralize from 'pluralize';

export class Str {
    static replaceAll(str: string, search: string, replace: string) {
        return str.split(search).join(replace);
    }

    static camelCase(str: string) {
        return str.replace(/[\W_]+(.)/g, (_, chr) => chr.toUpperCase());
    }

    static pascalCase(str: string) {
        return this.ucFirst(this.camelCase(str));
    }

    static snakeCase(str: string) {
        return this.slugify(str, '_').replace(/\_\_/g, '_');
    }

    static dashedCase(str: string) {
        return this.slugify(str, '-').replace(/\-\-/g, '-');
    }

    static slugify(str: string, symbol: string = '-') {
        let capitals = str.match(/[A-Z]+/g) || [];
        let parts = str.split(/[A-Z]/);
        let firstIsCapital = /[A-Z]/.exec(str)?.index === 0;

        if (firstIsCapital) {
            parts.shift();
        }

        let slugParts = [];

        for (let index = 0; index < parts.length; index++) {
            const word = parts[index];
            const capitalIndex = firstIsCapital ? index : index - 1;

            slugParts.push((capitals[capitalIndex] ? capitals[capitalIndex] : '') + word);
        }

        return slugParts
            .join(symbol)
            .replace(/[\W_]/g, symbol)
            .toLowerCase();
    }

    static ucFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static lcFirst(str: string) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    static plural(str: string) {
        return pluralize.plural(str);
    }

    static singular(str: string) {
        return pluralize.singular(str);
    }
}
