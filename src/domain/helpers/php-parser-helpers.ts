import * as phpParser from "php-parser";

export type PropertiesList = {
    [name: string]: phpParser.Property;
};

export type MethodsList = {
    [name: string]: phpParser.Method;
};

export type UsesList = {
    [alias: string]: string;
};

/**
 * Helpers for work with php parser
 */
export class PhpParserHelpers {

    /**
     * Returns AST
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getAst(code: string, fileName: string): phpParser.Program {
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

    /**
     * Returns list of `use` declarations from document
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getUsesList(code: string, fileName: string): UsesList {
        const ast = this.getAst(code, fileName);
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

    /**
     * Returns class ast
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getClass(code: string, fileName: string): phpParser.Class | undefined {
        const ast = this.getAst(code, fileName);
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

    /**
     * Returns class properties
     *
     * @param phpClass
     * @returns
     */
    static getProperties(phpClass: phpParser.Class): PropertiesList {
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

    /**
     * Returns class methods
     *
     * @param phpClass
     * @returns
     */
    static getMethods(phpClass: phpParser.Class): MethodsList {
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

    /**
     * Returns list of public methods from class not having `__` or `_on` in name
     *
     * @param controllerClass
     * @returns
     */
    static getControllerPageMethodsFromDocument(controllerClass: phpParser.Class): MethodsList {
        const methods = this.getMethods(controllerClass);
        if (!methods) {
            return {};
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

    static getPropertiesFromDockBlock(comment: phpParser.CommentBlock | phpParser.Comment) {
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
}
