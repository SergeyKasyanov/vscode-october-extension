import * as vscode from 'vscode';
import * as phpParser from "php-parser";

export interface PropertiesList {
    [name: string]: phpParser.Property;
};

export interface MethodsList {
    [name: string]: phpParser.Method;
};

export interface UsesList {
    [alias: string]: string;
};

/**
 * Helpers for work with php parser
 */
export class PhpHelpers {

    /**
     * Returns AST
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getAst(code: string, fileName: string): phpParser.Program | null {
        const engine = new phpParser.Engine({
            parser: {
                extractDoc: true,
                suppressErrors: true,
            },
            ast: {
                withPositions: true,
            },
        });

        try {
            return engine.parseCode(code, fileName);
        } catch (err) {
            return null;
        }
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
        const ns = ast?.children.find(el => el.kind === 'namespace') as phpParser.Namespace;

        const uses: UsesList = {};

        (ns || ast)?.children.forEach(el => {
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
     * Returns namespace from file
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getNamespace(code: string, fileName: string) {
        const ast = this.getAst(code, fileName);
        return ast?.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
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
        const ns = ast?.children.find(el => el.kind === 'namespace') as phpParser.Namespace;

        return (ns || ast)?.children.find(el => el.kind === 'class') as phpParser.Class;
    }

    /**
     * Return class ast for "return new class" files
     *
     * @param code
     * @param fileName
     * @returns
     */
    static getReturnNewClass(code: string, fileName: string): phpParser.Class | undefined {
        const ast = PhpHelpers.getAst(code, fileName);
        const ns = PhpHelpers.getNamespace(code, fileName);

        const returnStmt = (ns || ast)?.children.find(el => el.kind === 'return') as phpParser.Return;
        if (!returnStmt) {
            return;
        }

        if (returnStmt.expr?.kind !== 'new') {
            return;
        }

        if ((returnStmt.expr! as phpParser.New).what.kind !== 'class') {
            return;
        }

        return (returnStmt.expr as phpParser.New).what as phpParser.Class;
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
                        const propName = this.identifierToString(prop.name);

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
                const methodName = this.identifierToString(el.name);
                methodsList[methodName] = (el as phpParser.Method);
            }
        });

        return methodsList;
    }

    /**
     * Returns identifier name
     *
     * @param identifier
     * @returns
     */
    static identifierToString(identifier: phpParser.Identifier | string): string {
        if (identifier instanceof Object) {
            return identifier.name;
        }

        return identifier;
    }

    /**
     * Convert name object to fqn string
     *
     * @param name
     * @param uses
     * @returns
     */
    static lookupNameToFqn(name: phpParser.Name, uses: UsesList): string | undefined {
        switch (name.resolution) {
            case 'fqn':
                return name.name.startsWith('\\')
                    ? name.name.substring(1)
                    : name.name;
            case 'uqn':
                return uses[name.name];
            case 'qn':
                const nameParts = name.name.split('\\');
                const nsAlias = nameParts.shift();
                return uses[nsAlias!] + '\\' + nameParts.join('\\');
        }
    }

    /**
     * Build object from php array
     *
     * @param phpArray
     * @returns
     */
    static phpArrayToObject(phpArray: phpParser.Array): any {
        const result: any = {};
        let numericIndex = 0;

        phpArray.items.forEach(entry => {
            const entryKey = (entry as phpParser.Entry).key;
            const entryValue = (entry as phpParser.Entry).value;

            const key = entryKey?.kind === 'string'
                ? (entryKey as phpParser.String).value
                : ++numericIndex;

            result[key] = null;

            if (entryValue.kind === 'string' || entry.kind === 'number') {
                result[key] = (entryValue as phpParser.String | phpParser.Number).value;
            } else if (entryValue.kind === 'boolean') {
                result[key] = (entryValue as phpParser.Boolean).value;
            } else if (entryValue.kind === 'array') {
                result[key] = this.phpArrayToObject((entryValue as phpParser.Array));
            } else if (entryValue.kind === 'call') {
                const callFunc = entryValue as phpParser.Call;
                const funcName = callFunc.what.name;

                if (typeof funcName === 'string'
                    && ['_', '__', 'trans', 'trans_choice'].includes(funcName)
                    && callFunc.arguments.length > 0
                ) {
                    const firstArg = callFunc.arguments[0];
                    if (firstArg.kind === 'string') {
                        result[key] = (firstArg as phpParser.String).value;
                    }
                }
            }
        });

        return result;
    }

    /**
     * Return class properties from docblock
     *
     * @param comment
     * @returns
     */
    static getPropertiesFromDocBlock(comment: phpParser.CommentBlock | phpParser.Comment) {
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

    /**
     * Php elem location to vscode Range convertor
     */
    static locationToRange(loc: phpParser.Location): vscode.Range {
        const start = new vscode.Position(loc.start.line - 1, loc.start.column);
        const end = new vscode.Position(loc.end.line - 1, loc.end.column);

        return new vscode.Range(start, end);
    }
}
