import * as phpParser from "php-parser";

export type PropertiesList = {
    [name: string]: phpParser.Property;
};

export type MethodsList = {
    [name: string]: phpParser.Method;
};

export function parsePhp(code: string, fileName: string): import("php-parser").Program {
    const engine = new phpParser.Engine({
        parser: {
            extractDoc: true,
            suppressErrors: true,
        },
        ast: {
            withPositions: true,
        },
    });

    return engine.parseCode(code, fileName);
}

export function getUsesFromDocument(code: string, fileName: string): { [alias: string]: string; } {
    const ast = parsePhp(code, fileName);
    const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
    if (!ns) {
        return {};
    }

    let uses: { [alias: string]: string } = {};

    ns.children.forEach(el => {
        if (el.kind === 'usegroup') {
            const items: phpParser.UseItem[] = (el as any).items;

            for (const useItem of items) {
                let name = useItem.name;

                if (!name.startsWith('\\')) {
                    name = '\\' + name;
                }

                if (useItem.alias) {
                    uses[useItem.alias.name] = useItem.name;
                } else {
                    const alias = name.split('\\').pop();
                    uses[alias!] = useItem.name;
                }
            }
        }
    });

    return uses;
}

export function getClassFromDocument(code: string, fileName: string): phpParser.Class | undefined {
    const ast = parsePhp(code, fileName);
    const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
    if (!ns) {
        return;
    }

    const phpClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
    if (!phpClass) {
        return;
    }

    return phpClass;
}

export function getClassPropertiesFromDocument(code: string, fileName: string): PropertiesList | undefined {
    const phpClass = getClassFromDocument(code, fileName);
    if (!phpClass) {
        return;
    }

    let properties: PropertiesList = {};

    phpClass.body.forEach(el => {
        if (el.kind === 'propertystatement') {
            const classProperties = (el as unknown as phpParser.PropertyStatement).properties;
            for (const prop of classProperties) {
                if (prop.kind === 'property') {
                    const propIdentifier = prop.name as phpParser.Identifier | string;
                    const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;

                    properties[propName] = prop;
                }
            }
        }
    });

    return properties;
}

export function getClassMethodsFromDocument(code: string, fileName: string): MethodsList | undefined {
    const phpClass = getClassFromDocument(code, fileName);
    if (!phpClass) {
        return;
    }

    let methodsList: MethodsList = {};

    phpClass.body.forEach(el => {
        if (el.kind === 'method') {
            const methodIdentifier = el.name as phpParser.Identifier | string;
            const methodName = methodIdentifier instanceof Object ? methodIdentifier.name : methodIdentifier;

            methodsList[methodName] = (el as phpParser.Method);
        }
    });

    return methodsList;
}

export function getControllerPageMethodsFromDocument(code: string, fileName: string) {
    const methods = getClassMethodsFromDocument(code, fileName);
    if (!methods) {
        return;
    }

    let result: { [name: string]: phpParser.Method } = {};

    for (const meth in methods) {
        if (Object.prototype.hasOwnProperty.call(methods, meth)) {
            const method = methods[meth];

            // skip __magic and page_onAjax methods
            if (meth.startsWith('__') || meth.includes('_on')) {
                continue;
            }

            // only for public methods
            if (method.visibility !== 'public' || !method.loc) {
                continue;
            }

            const methodName = method.name instanceof Object ? method.name.name : method.name;

            result[methodName] = method;
        }
    }

    return result;
}

export function getPropertiesFromDockBlock(comment: phpParser.CommentBlock | phpParser.Comment) {
    const commentText = comment.value;

    let properties: string[] = [];

    const lines = commentText.split(/\r?\n/);
    for (const line of lines) {
        const propMatch = line.match(/\s*\*\s*\@(property|property-read)/);
        if (!propMatch) {
            continue;
        }

        const varMatch = line.match(/\$\w+/);
        if (!varMatch) {
            continue;
        }

        const varName = varMatch[0].slice(1);

        properties.push(varName);
    }

    return properties;
}
