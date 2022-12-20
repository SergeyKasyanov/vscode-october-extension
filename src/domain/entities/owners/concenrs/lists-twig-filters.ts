import * as vscode from 'vscode';
import * as phpParser from 'php-parser';
import { TwigFiltersList } from "../../../static/twig-filters";
import { BackendOwner } from "../backend-owner";
import { PhpHelpers } from '../../../helpers/php-helpers';

/**
 * Lists twig filters registered in Plugin.php or app's Provider.php
 */
export class ListsTwigFilters {
    constructor(
        private ocOwner: BackendOwner
    ) { }

    /**
     * Twig filters of owner
     */
    get twigFilters(): TwigFiltersList {
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

        const result: TwigFiltersList = {};

        for (const _entry of (returnExpr.expr as phpParser.Array).items) {
            const entry = _entry as phpParser.Entry;
            if (entry.key?.kind !== 'string') {
                continue;
            }

            if ((entry.key as phpParser.String).value !== 'filters') {
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

                const twigFilterName = (item.key as phpParser.String).value;

                if (item.value.kind === 'string') {

                    /*
                     * Use php function
                     * Example:
                     *
                     * return [
                     *     'filters' => [
                     *         'twigFunc' => 'str_plural',
                     *     ]
                     * ];
                     */

                    result[twigFilterName] = {
                        name: twigFilterName,
                        snippet: twigFilterName,
                        doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                    };
                } else if (item.value.kind === 'array') {
                    const valueItems = (item.value as phpParser.Array).items;
                    if (valueItems.length !== 2) {
                        result[twigFilterName] = {
                            name: twigFilterName,
                            snippet: twigFilterName,
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                        return;
                    }

                    const cbClass = valueItems[0] as phpParser.Entry;
                    const cbMethod = valueItems[1] as phpParser.Entry;

                    if (cbClass.key !== null || cbMethod.key !== null) {
                        result[twigFilterName] = {
                            name: twigFilterName,
                            snippet: twigFilterName,
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
                         *     'filters' => [
                         *         'twigFunc' => [$this, 'makeTextAllCaps'],
                         *     ]
                         * ];
                         */

                        const methodName = (cbMethod.value as phpParser.String).value;
                        const method = methods[methodName];
                        if (!method) {
                            return;
                        }

                        let i = 1;
                        let snippetParams = '';
                        const params = method.arguments.slice(1).map(param => PhpHelpers.identifierToString(param.name));
                        if (params.length > 0) {
                            snippetParams = '('
                                + params.map(param => '\${' + (i++).toString() + ':' + param + '}').join(', ')
                                + ')';
                        }

                        const snippet = twigFilterName + snippetParams;

                        result[twigFilterName] = {
                            name: twigFilterName,
                            snippet,
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                    } else if (cbClass.value.kind === 'staticlookup') {

                        /*
                         * Use method from class
                         * Example:
                         *
                         * return [
                         *     'filters' => [
                         *         'twigFunc' => [MyTwigFunctions::class, 'makeTextAllCaps'],
                         *     ]
                         * ];
                         */

                        // TODO: load parameters list from class

                        result[twigFilterName] = {
                            name: twigFilterName,
                            snippet: twigFilterName,
                            doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                        };
                    }
                } else if (item.value.kind === 'closure') {

                    /*
                     * Use closure
                     * Example:
                     *
                     * return [
                     *     'filters' => [
                     *         'twigFunc' => function($name) { return 'Hello ' . $name; },
                     *     ]
                     * ];
                     */

                    let snippetParams = '';
                    const params = (item.value as phpParser.Closure).arguments.slice(1).map(param => PhpHelpers.identifierToString(param.name));
                    if (params.length > 0) {
                        let i = 1;
                        snippetParams = '('
                            + params.map(param => '\${' + (i++).toString() + ':' + param + '}').join(', ')
                            + ')';
                    }

                    const snippet = twigFilterName + snippetParams;

                    result[twigFilterName] = {
                        name: twigFilterName,
                        snippet,
                        doc: new vscode.MarkdownString(`From: ` + this.ocOwner.name)
                    };
                }
            });

        }

        return result;
    }
}
