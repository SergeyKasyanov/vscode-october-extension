/* eslint-disable @typescript-eslint/naming-convention */
import { MarkdownString } from "vscode";
import { TwigFunction } from "../../../types/twig/twigFunction";
import { Version } from "../../../domain/enums/october-version";

const defaultTwigFunctions: { [name: string]: TwigFunction } = {

    //
    // Default Twig functions
    //

    attribute: {
        name: 'attribute',
        snippet: 'attribute(${1:object}, ${2:method}, ${3:arguments})',
        doc: new MarkdownString(`The attribute function can be used to access a "dynamic" attribute of a variable.

[Documentation](https://twig.symfony.com/doc/3.x/functions/attribute.html)`)
    },
    constant: {
        name: 'constant',
        snippet: 'constant(\'${1:name}\', ${2:object})',
        doc: new MarkdownString(`Returns the constant value for a given string.

[Documentation](https://twig.symfony.com/doc/3.x/functions/constant.html)`),
    },
    cycle: {
        name: 'cycle',
        snippet: 'cycle(${1:array}, ${2:position})',
        doc: new MarkdownString(`The cycle function cycles on an array of values.

[Documentation](https://twig.symfony.com/doc/3.x/functions/cycle.html)`),
    },
    date: {
        name: 'date',
        snippet: 'date(\'${1:date}\', \'${2:timezone}\')',
        doc: new MarkdownString(`Converts an argument to a date to allow date comparison.

[Documentation](https://twig.symfony.com/doc/3.x/functions/date.html)`),
    },
    dump: {
        name: 'dump',
        snippet: 'dump(${1:var})',
        doc: new MarkdownString(`The dump function dumps information about a template variable.

[Documentation](https://twig.symfony.com/doc/3.x/functions/dump.html)`),
    },
    max: {
        name: 'max',
        snippet: 'max(${1:values})',
        doc: new MarkdownString(`Returns the biggest value of a sequence or a set of values.

[Documentation](https://twig.symfony.com/doc/3.x/functions/max.html)`),
    },
    min: {
        name: 'min',
        snippet: 'min(${1:values})',
        doc: new MarkdownString(`Returns the lowest value of a sequence or a set of values

[Documentation](https://twig.symfony.com/doc/3.x/functions/min.html)`),
    },
    random: {
        name: 'random',
        snippet: 'random(${1:values}, ${2:max})',
        doc: new MarkdownString(`Returns a random value depending on the supplied parameter type:

- a random item from a sequence;
- a random character from a string;
- a random integer between 0 and the integer parameter (inclusive).
- a random integer between the integer parameter (when negative) and 0 (inclusive).
- a random integer between the first integer and the second integer parameter (inclusive).

[Documentation](https://twig.symfony.com/doc/3.x/functions/random.html)`),
    },
    range: {
        name: 'range',
        snippet: 'range(${1:low}, ${2:high}, ${3:step})',
        doc: new MarkdownString(`Returns a list containing an arithmetic progression of integers.

[Documentation](https://twig.symfony.com/doc/3.x/functions/range.html)`),
    },
    source: {
        name: 'source',
        snippet: 'source(${1:tpl})',
        doc: new MarkdownString(`Returns the content of a template without rendering it.

[Documentation](https://twig.symfony.com/doc/3.x/functions/source.html)`),
    },

    //
    // OctoberCMS Specific Twig functions
    //

    input: {
        name: 'input',
        snippet: 'input(${1:param}, ${2:default})',
        doc: new MarkdownString('Returns an input parameter or the default value'),
    },
    post: {
        name: 'post',
        snippet: 'post(${1:param}, ${2:default})',
        doc: new MarkdownString('Post is an identical function to input(), however restricted to POST methods.'),
    },
    get: {
        name: 'get',
        snippet: 'get(${1:param}, ${2:default})',
        doc: new MarkdownString('Get is an identical function to input(), however restricted to GET values.'),
    },
    link_to: {
        name: 'link_to',
        snippet: 'link_to(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new MarkdownString('Generate a HTML link.'),
    },
    link_to_asset: {
        name: 'link_to_asset',
        snippet: 'link_to_asset(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new MarkdownString('Generate a HTML link to an asset.'),
    },
    link_to_route: {
        name: 'link_to_route',
        snippet: 'link_to_route(${1:name}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new MarkdownString('Generate a HTML link to a named route.'),
    },
    link_to_action: {
        name: 'link_to_action',
        snippet: 'link_to_action(${1:name}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new MarkdownString('Generate a HTML link to a controller action.'),
    },
    asset: {
        name: 'asset',
        snippet: 'asset(${1:path}, ${2:secure})',
        doc: new MarkdownString('Generate an asset path for the application.'),
    },
    action: {
        name: 'action',
        snippet: 'action(${1:name}, ${2:parameters}, ${3:absolute})',
        doc: new MarkdownString('Generate the URL to a controller action.'),
    },
    url: {
        name: 'url',
        snippet: 'url(${1:path}, ${2:parameters}, ${3:secure})',
        doc: new MarkdownString('Generate a url for the application.'),
    },
    route: {
        name: 'route',
        snippet: 'route(${1:name}, ${2:parameters}, ${3:absolute})',
        doc: new MarkdownString('Generate the URL to a named route.'),
    },
    secure_url: {
        name: 'secure_url',
        snippet: 'secure_url(${1:path}, ${2:parameters})',
        doc: new MarkdownString('Generate a HTTPS url for the application.'),
    },
    secure_asset: {
        name: 'secure_asset',
        snippet: 'secure_asset(${1:path})',
        doc: new MarkdownString('Generate an asset path for the application.'),
    },
    ajaxHandler: {
        minVersion: Version.oc30,
        name: 'ajaxHandler',
        snippet: 'ajaxHandler(\'${1:name}\')',
        doc: new MarkdownString(`Runs an AJAX handler inside Twig and prepares a Cms\\Classes\\AjaxResponse response object.

[Documentation](https://docs.octobercms.com/3.x/markup/function/ajax-handler.html)`),
    },
    response: {
        minVersion: Version.oc30,
        name: 'response',
        snippet: 'response(${1:params})',
        doc: new MarkdownString(`Overrides the page from being displayed and returns a response, usually in the form of JSON payload.

[Documentation](https://docs.octobercms.com/3.x/markup/function/response.html)`),
    },
    redirect: {
        minVersion: Version.oc20,
        name: 'redirect',
        snippet: 'redirect(${1:url}, ${2:code})',
        doc: new MarkdownString(`Redirects the response to a URL or theme page.

[Documentation](https://docs.octobercms.com/3.x/markup/function/redirect.html)`)
    },
    collect: {
        minVersion: Version.oc30,
        name: 'collect',
        snippet: 'collect(${1:data})',
        doc: new MarkdownString(`Provides a nicer interface for building arrays in Twig.

[Documentation](https://docs.octobercms.com/3.x/markup/function/collect.html)`)
    },
    pager: {
        minVersion: Version.oc30,
        name: 'pager',
        snippet: 'pager(${1:paginator})',
        doc: new MarkdownString(`Extracts the paginated links and meta data from a paginated query.

[Documentation](https://docs.octobercms.com/3.x/markup/function/pager.html)`),
    },
    abort: {
        minVersion: Version.oc20,
        name: 'abort',
        snippet: 'abort(${1:code})',
        doc: new MarkdownString(`Aborts the successful request path by changing the response code and contents.

[Documentation](https://docs.octobercms.com/3.x/markup/function/abort.html)`),
    },
    partial: {
        name: 'partial',
        snippet: 'partial(${1:name})',
        doc: 'Render partial to string'
    },
    // str_*
    // form_*
    // html_*
};

export default defaultTwigFunctions;
