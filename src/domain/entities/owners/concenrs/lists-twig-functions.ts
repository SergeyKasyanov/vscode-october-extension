import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import { PhpHelpers } from "../../../helpers/php-helpers";
import { TwigFunctionsList } from "../../../static/twig-functions";
import { BackendOwner } from '../backend-owner';

/**
 * Lists twig functions registered in Plugin.php or app's Provider.php
 */
export class ListsTwigFunctions {
    constructor(
        private ocOwner: BackendOwner
    ) { }

    /**
     * Twig functions registered in owner(app, plugin) registration file
     */
    get twigFunctions(): TwigFunctionsList {
        const fileContent = this.ocOwner.registrationFileContent;
        if (!fileContent) {
            return {};
        }

        const phpClass = PhpHelpers.getClass(fileContent, this.ocOwner.path);
        if (!phpClass) {
            return {};
        }

        const methods = PhpHelpers.getMethods(phpClass);

        const registerMarkupTags = methods.registerMarkupTags;
        if (!registerMarkupTags) {
            return {};
        }

        const returnExpr = registerMarkupTags.body?.children.find(el => el.kind === 'return') as phpParser.Return;
        if (returnExpr?.expr?.kind !== 'array') {
            return {};
        }

        const result: TwigFunctionsList = {};

        for (const _entry of (returnExpr.expr as phpParser.Array).items) {
            const entry = _entry as phpParser.Entry;
            if (entry.key?.kind !== 'string') {
                continue;
            }

            if ((entry.key as phpParser.String).value !== 'functions') {
                continue;
            }

            if (entry.value.kind !== 'array') {
                continue;
            }

            (entry.value as phpParser.Array).items.forEach(_item => {
                const item = _item as phpParser.Entry;
                if (item.key?.kind !== 'string') {
                    return;
                }

                const twigFuncName = (item.key as phpParser.String).value;

                if (item.value.kind === 'string') {

                    /*
                     * Use php function
                     * Example:
                     *
                     * return [
                     *     'functions' => [
                     *         'twigFunc' => 'str_plural',
                     *     ]
                     * ];
                     */

                    result[twigFuncName] = {
                        name: twigFuncName,
                        snippet: twigFuncName + '()',
                        doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                    };
                } else if (item.value.kind === 'array') {
                    const valueItems = (item.value as phpParser.Array).items;
                    if (valueItems.length !== 2) {
                        result[twigFuncName] = {
                            name: twigFuncName,
                            snippet: twigFuncName + '()',
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                        return;
                    }

                    const cbClass = valueItems[0] as phpParser.Entry;
                    const cbMethod = valueItems[1] as phpParser.Entry;

                    if (cbClass.key !== null || cbMethod.key !== null) {
                        result[twigFuncName] = {
                            name: twigFuncName,
                            snippet: twigFuncName + '()',
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                        return;
                    }

                    if (cbClass.value.kind === 'variable'
                        && (cbClass.value as phpParser.Variable).name === 'this'
                        && cbMethod.value.kind === 'string'
                    ) {

                        /*
                         * Use Plugin.php method
                         * Example:
                         *
                         * return [
                         *     'functions' => [
                         *         'twigFunc' => [$this, 'makeTextAllCaps'],
                         *     ]
                         * ];
                         */

                        const methodName = (cbMethod.value as phpParser.String).value;
                        const method = methods[methodName];
                        if (!method) {
                            return;
                        }

                        const params = method.arguments.map(param => PhpHelpers.identifierToString(param.name));

                        let i = 1;
                        const snippet = twigFuncName
                            + '('
                            + params.map(param => '\${' + (i++).toString() + ':' + param + '}').join(', ')
                            + ')';

                        result[twigFuncName] = {
                            name: twigFuncName,
                            snippet,
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                    } else if (cbClass.value.kind === 'staticlookup') {

                        /*
                         * Use method from class
                         * Example:
                         *
                         * return [
                         *     'functions' => [
                         *         'twigFunc' => [MyTwigFunctions::class, 'makeTextAllCaps'],
                         *     ]
                         * ];
                         */

                        // TODO: load parameters list from class

                        result[twigFuncName] = {
                            name: twigFuncName,
                            snippet: twigFuncName + '()',
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                    }
                } else if (item.value.kind === 'closure') {

                    /*
                     * Use closure
                     * Example:
                     *
                     * return [
                     *     'functions' => [
                     *         'twigFunc' => function($name) { return 'Hello ' . $name; },
                     *     ]
                     * ];
                     */

                    const params = (item.value as phpParser.Closure).arguments.map(param => PhpHelpers.identifierToString(param.name));

                    let i = 1;
                    const snippet = twigFuncName
                        + '('
                        + params.map(param => '\${' + (i++).toString() + ':' + param + '}').join(', ')
                        + ')';

                    result[twigFuncName] = {
                        name: twigFuncName,
                        snippet,
                        doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                    };
                }
            });

        }

        return result;
    }
}
