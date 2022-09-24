export function camelCase(str: string) {
    return str.replace(/[\W_]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function pascalCase(str: string) {
    const camelStr = camelCase(str);
    return ucFirst(camelStr);
}

export function snakeCase(str: string) {
    return slugify(str, '_').replace(/\_\_/g, '_');
}

export function dashedCase(str: string) {
    return slugify(str, '-').replace(/\-\-/g, '-');
}

export function slugify(str: string, symbol: string = '-') {
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

export function ucFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lcFirst(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
