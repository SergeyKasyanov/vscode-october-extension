/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { Version } from '../enums/october-version';

export interface TwigFunction {
    name: string,
    snippet: string,
    doc?: string | vscode.MarkdownString,
    minVersion?: Version,
}

export interface TwigFunctionsList {
    [name: string]: TwigFunction;
}

export const twigFunctions: TwigFunctionsList = {

    //
    // Default Twig functions
    //

    attribute: {
        name: 'attribute',
        snippet: 'attribute(${1:object}, ${2:method}, ${3:arguments})',
        doc: new vscode.MarkdownString(`The attribute function can be used to access a "dynamic" attribute of a variable.

[Documentation](https://twig.symfony.com/doc/3.x/functions/attribute.html)`)
    },
    constant: {
        name: 'constant',
        snippet: 'constant(\'${1:name}\', ${2:object})',
        doc: new vscode.MarkdownString(`Returns the constant value for a given string.

[Documentation](https://twig.symfony.com/doc/3.x/functions/constant.html)`),
    },
    cycle: {
        name: 'cycle',
        snippet: 'cycle(${1:array}, ${2:position})',
        doc: new vscode.MarkdownString(`The cycle function cycles on an array of values.

[Documentation](https://twig.symfony.com/doc/3.x/functions/cycle.html)`),
    },
    date: {
        name: 'date',
        snippet: 'date(\'${1:date}\', \'${2:timezone}\')',
        doc: new vscode.MarkdownString(`Converts an argument to a date to allow date comparison.

[Documentation](https://twig.symfony.com/doc/3.x/functions/date.html)`),
    },
    dump: {
        name: 'dump',
        snippet: 'dump(${1:var})',
        doc: new vscode.MarkdownString(`The dump function dumps information about a template variable.

[Documentation](https://twig.symfony.com/doc/3.x/functions/dump.html)`),
    },
    max: {
        name: 'max',
        snippet: 'max(${1:values})',
        doc: new vscode.MarkdownString(`Returns the biggest value of a sequence or a set of values.

[Documentation](https://twig.symfony.com/doc/3.x/functions/max.html)`),
    },
    min: {
        name: 'min',
        snippet: 'min(${1:values})',
        doc: new vscode.MarkdownString(`Returns the lowest value of a sequence or a set of values

[Documentation](https://twig.symfony.com/doc/3.x/functions/min.html)`),
    },
    random: {
        name: 'random',
        snippet: 'random(${1:values}, ${2:max})',
        doc: new vscode.MarkdownString(`Returns a random value depending on the supplied parameter type:

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
        doc: new vscode.MarkdownString(`Returns a list containing an arithmetic progression of integers.

[Documentation](https://twig.symfony.com/doc/3.x/functions/range.html)`),
    },
    source: {
        name: 'source',
        snippet: 'source(${1:tpl})',
        doc: new vscode.MarkdownString(`Returns the content of a template without rendering it.

[Documentation](https://twig.symfony.com/doc/3.x/functions/source.html)`),
    },

    //
    // OctoberCMS Specific Twig functions
    //

    input: {
        name: 'input',
        snippet: 'input(${1:param}, ${2:default})',
        doc: new vscode.MarkdownString('Returns an input parameter or the default value'),
    },
    post: {
        name: 'post',
        snippet: 'post(${1:param}, ${2:default})',
        doc: new vscode.MarkdownString('Post is an identical function to input(), however restricted to POST methods.'),
    },
    get: {
        name: 'get',
        snippet: 'get(${1:param}, ${2:default})',
        doc: new vscode.MarkdownString('Get is an identical function to input(), however restricted to GET values.'),
    },
    link_to: {
        name: 'link_to',
        snippet: 'link_to(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new vscode.MarkdownString('Generate a HTML link.'),
    },
    link_to_asset: {
        name: 'link_to_asset',
        snippet: 'link_to_asset(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new vscode.MarkdownString('Generate a HTML link to an asset.'),
    },
    link_to_route: {
        name: 'link_to_route',
        snippet: 'link_to_route(${1:name}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new vscode.MarkdownString('Generate a HTML link to a named route.'),
    },
    link_to_action: {
        name: 'link_to_action',
        snippet: 'link_to_action(${1:name}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new vscode.MarkdownString('Generate a HTML link to a controller action.'),
    },
    asset: {
        name: 'asset',
        snippet: 'asset(${1:path}, ${2:secure})',
        doc: new vscode.MarkdownString('Generate an asset path for the application.'),
    },
    action: {
        name: 'action',
        snippet: 'action(${1:name}, ${2:parameters}, ${3:absolute})',
        doc: new vscode.MarkdownString('Generate the URL to a controller action.'),
    },
    url: {
        name: 'url',
        snippet: 'url(${1:path}, ${2:parameters}, ${3:secure})',
        doc: new vscode.MarkdownString('Generate a url for the application.'),
    },
    route: {
        name: 'route',
        snippet: 'route(${1:name}, ${2:parameters}, ${3:absolute})',
        doc: new vscode.MarkdownString('Generate the URL to a named route.'),
    },
    secure_url: {
        name: 'secure_url',
        snippet: 'secure_url(${1:path}, ${2:parameters})',
        doc: new vscode.MarkdownString('Generate a HTTPS url for the application.'),
    },
    secure_asset: {
        name: 'secure_asset',
        snippet: 'secure_asset(${1:path})',
        doc: new vscode.MarkdownString('Generate an asset path for the application.'),
    },
    ajaxHandler: {
        minVersion: Version.oc30,
        name: 'ajaxHandler',
        snippet: 'ajaxHandler(\'${1:name}\')',
        doc: new vscode.MarkdownString(`Runs an AJAX handler inside Twig and prepares a Cms\\Classes\\AjaxResponse response object.

[Documentation](https://docs.octobercms.com/3.x/markup/function/ajax-handler.html)`),
    },
    response: {
        minVersion: Version.oc30,
        name: 'response',
        snippet: 'response(${1:params})',
        doc: new vscode.MarkdownString(`Overrides the page from being displayed and returns a response, usually in the form of JSON payload.

[Documentation](https://docs.octobercms.com/3.x/markup/function/response.html)`),
    },
    redirect: {
        minVersion: Version.oc20,
        name: 'redirect',
        snippet: 'redirect(${1:url}, ${2:code})',
        doc: new vscode.MarkdownString(`Redirects the response to a URL or theme page.

[Documentation](https://docs.octobercms.com/3.x/markup/function/redirect.html)`)
    },
    collect: {
        minVersion: Version.oc30,
        name: 'collect',
        snippet: 'collect(${1:data})',
        doc: new vscode.MarkdownString(`Provides a nicer interface for building arrays in Twig.

[Documentation](https://docs.octobercms.com/3.x/markup/function/collect.html)`)
    },
    pager: {
        minVersion: Version.oc30,
        name: 'pager',
        snippet: 'pager(${1:paginator})',
        doc: new vscode.MarkdownString(`Extracts the paginated links and meta data from a paginated query.

[Documentation](https://docs.octobercms.com/3.x/markup/function/pager.html)`),
    },
    abort: {
        minVersion: Version.oc20,
        name: 'abort',
        snippet: 'abort(${1:code})',
        doc: new vscode.MarkdownString(`Aborts the successful request path by changing the response code and contents.

[Documentation](https://docs.octobercms.com/3.x/markup/function/abort.html)`),
    },
    partial: {
        name: 'partial',
        snippet: 'partial(${1:name})',
        doc: new vscode.MarkdownString(`Render partial to string`)
    },
    env: {
        name: 'env',
        snippet: 'env(${1:key}, ${2:default})',
    },
    config: {
        name: 'config',
        snippet: 'config()',
    },
    carbon: {
        name: 'carbon',
        snippet: 'carbon(${1:value})',
        doc: new vscode.MarkdownString(`Function returns a Carbon function with timezone preference applied.

@see \\System\\Twig\\Extension::carbonFunction`)
    },
    page: {
        name: 'page',
        snippet: 'page()',
        doc: new vscode.MarkdownString(`Function renders a page.

This function should be used in the layout code to output the requested page.

@return string

@see \\Cms\\Twig\\Extension::pageFunction`)
    },
    hasPartial: {
        name: 'hasPartial',
        snippet: 'hasPartial(${1:name})',
        doc: new vscode.MarkdownString(`Function checks the partials existence without rendering it.

@return bool

@see \\Cms\\Twig\\Extension::hasPartialFunction`)
    },
    content: {
        name: 'content',
        snippet: 'content(${1:name}, ${2:parameters}, ${3:throw_exception})',
        doc: new vscode.MarkdownString(`Function renders a partial based on the file name. The parameters

are an optional list of view variables, otherwise pass false to render nothing

and check the existence. An exception can be thrown if nothing is found.

@return string

@see \\Cms\\Twig\\Extension::contentFunction`)
    },
    hasContent: {
        name: 'hasContent',
        snippet: 'hasContent(${1:name})',
        doc: new vscode.MarkdownString(`Function checks the content existence without rendering it.

@return bool

@see \\Cms\\Twig\\Extension::hasContentFunction`)
    },
    component: {
        name: 'component',
        snippet: 'component(${1:name}, ${2:parameters})',
        doc: new vscode.MarkdownString(`Function renders a component\'s default content.

@param string $name Specifies the component name.

@param array $parameters A optional list of parameters to pass to the component.

@return string

@see \\Cms\\Twig\\Extension::componentFunction`)
    },
    placeholder: {
        name: 'placeholder',
        snippet: 'placeholder(${1:name}, ${2:default})',
        doc: new vscode.MarkdownString(`Function renders a placeholder content, without removing the block,

must be called before the placeholder tag itself

@return string

@see \\Cms\\Twig\\Extension::placeholderFunction`)
    },
    hasPlaceholder: {
        name: 'hasPlaceholder',
        snippet: 'hasPlaceholder(${1:name})',
        doc: new vscode.MarkdownString(`Function checks that a placeholder exists without rendering it

@see \\Cms\\Twig\\Extension::hasPlaceholderFunction`)
    },
    resource: {
        name: 'resource',
        snippet: 'resource(${1:resource})',
        doc: new vscode.MarkdownString(`Function will resolve a resouce before responding

@param mixed $resource

@see \\Cms\\Twig\\Extension::resourceFunction`)
    },
    d: {
        name: 'd',
        snippet: 'd(${1:vars})',
        doc: new vscode.MarkdownString(`dumpVars returns dumped variables

@see \\Cms\\Twig\\DebugExtension::dumpVars`)
    },
    dd: {
        name: 'dd',
        snippet: 'dd(${1:vars})',
        doc: new vscode.MarkdownString(`dumpVarsAndDie outputs dumped variables and then dies

@see \\Cms\\Twig\\DebugExtension::dumpVarsAndDie`)
    },

    //
    // Helpers
    //

    html_email: {
        name: 'html_email',
        snippet: 'html_email(${1:email})',
        doc: new vscode.MarkdownString(`email obfuscates an e-mail address to prevent spam-bots from sniffing it.

@param  string  $email

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::email`)
    },
    html_mailto: {
        name: 'html_mailto',
        snippet: 'html_mailto(${1:email}, ${2:title}, ${3:attributes})',
        doc: new vscode.MarkdownString(`mailto generates a HTML link to an email address.

@param  string  $email

@param  string  $title

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::mailto`)
    },
    html_entities: {
        name: 'html_entities',
        snippet: 'html_entities(${1:value})',
        doc: new vscode.MarkdownString(`entities converts an HTML string to entities.

@param  string  $value

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::entities`)
    },
    html_decode: {
        name: 'html_decode',
        snippet: 'html_decode(${1:value})',
        doc: new vscode.MarkdownString(`decode converts entities to HTML characters.

@param  string  $value

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::decode`)
    },
    html_script: {
        name: 'html_script',
        snippet: 'html_script(${1:url}, ${2:attributes}, ${3:secure})',
        doc: new vscode.MarkdownString(`script generates a link to a JavaScript file.

@param  string  $url

@param  array   $attributes

@param  bool    $secure

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::script`)
    },
    html_style: {
        name: 'html_style',
        snippet: 'html_style(${1:url}, ${2:attributes}, ${3:secure})',
        doc: new vscode.MarkdownString(`style generates a link to a CSS file.

@param  string  $url

@param  array   $attributes

@param  bool    $secure

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::style`)
    },
    html_image: {
        name: 'html_image',
        snippet: 'html_image(${1:url}, ${2:alt}, ${3:attributes}, ${4:secure})',
        doc: new vscode.MarkdownString(`image generates an HTML image element.

@param  string  $url

@param  string  $alt

@param  array   $attributes

@param  bool    $secure

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::image`)
    },
    html_link: {
        name: 'html_link',
        snippet: 'html_link(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new vscode.MarkdownString(`link generates a HTML link.

@param  string  $url

@param  string  $title

@param  array   $attributes

@param  bool    $secure

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::link`)
    },
    html_secure_link: {
        name: 'html_secure_link',
        snippet: 'html_secure_link(${1:url}, ${2:title}, ${3:attributes})',
        doc: new vscode.MarkdownString(`secureLink generates a HTTPS HTML link.

@param  string  $url

@param  string  $title

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::secureLink`)
    },
    html_link_asset: {
        name: 'html_link_asset',
        snippet: 'html_link_asset(${1:url}, ${2:title}, ${3:attributes}, ${4:secure})',
        doc: new vscode.MarkdownString(`linkAsset generates a HTML link to an asset.

@param  string  $url

@param  string  $title

@param  array   $attributes

@param  bool    $secure

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::linkAsset`)
    },
    html_link_secure_asset: {
        name: 'html_link_secure_asset',
        snippet: 'html_link_secure_asset(${1:url}, ${2:title}, ${3:attributes})',
        doc: new vscode.MarkdownString(`linkSecureAsset generates a HTTPS HTML link to an asset.

@param  string  $url

@param  string  $title

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::linkSecureAsset`)
    },
    html_link_route: {
        name: 'html_link_route',
        snippet: 'html_link_route(${1:name}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new vscode.MarkdownString(`linkRoute generates a HTML link to a named route.

@param  string  $name

@param  string  $title

@param  array   $parameters

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::linkRoute`)
    },
    html_link_action: {
        name: 'html_link_action',
        snippet: 'html_link_action(${1:action}, ${2:title}, ${3:parameters}, ${4:attributes})',
        doc: new vscode.MarkdownString(`linkAction generates a HTML link to a controller action.

@param  string  $action

@param  string  $title

@param  array   $parameters

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::linkAction`)
    },
    html_ol: {
        name: 'html_ol',
        snippet: 'html_ol(${1:list}, ${2:attributes})',
        doc: new vscode.MarkdownString(`ol generate an ordered list of items.

@param  array   $list

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::ol`)
    },
    html_ul: {
        name: 'html_ul',
        snippet: 'html_ul(${1:list}, ${2:attributes})',
        doc: new vscode.MarkdownString(`ul generates an un-ordered list of items.

@param  array   $list

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::ul`)
    },
    html_attributes: {
        name: 'html_attributes',
        snippet: 'html_attributes(${1:attributes})',
        doc: new vscode.MarkdownString(`Build an HTML attribute string from an array.

@param  array  $attributes

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::attributes`)
    },
    html_obfuscate: {
        name: 'html_obfuscate',
        snippet: 'html_obfuscate(${1:value})',
        doc: new vscode.MarkdownString(`obfuscate a string to prevent spam-bots from sniffing it.

@param  string  $value

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::obfuscate`)
    },
    html_strip: {
        name: 'html_strip',
        snippet: 'html_strip(${1:string}, ${2:allow})',
        doc: new vscode.MarkdownString(`strip removes HTML from a string, with allowed tags, e.g. <p>

@param $string

@param $allow

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::strip`)
    },
    html_limit: {
        name: 'html_limit',
        snippet: 'html_limit(${1:html}, ${2:max_length}, ${3:end})',
        doc: new vscode.MarkdownString(`limit HTML with specific length with a proper tag handling.

@param string $html HTML string to limit

@param int $maxLength String length to truncate at

@param  string  $end

@return string

@see \\October\\Rain\\Html\\HtmlBuilder::limit`)
    },
    html_minify: {
        name: 'html_minify',
        snippet: 'html_minify(${1:html})',
        doc: new vscode.MarkdownString(`minify makes HTML more compact

@see \\October\\Rain\\Html\\HtmlBuilder::minify`)
    },
    html_clean: {
        name: 'html_clean',
        snippet: 'html_clean(${1:html})',
        doc: new vscode.MarkdownString(`clean HTML to prevent most XSS attacks.

@param  string $html HTML

@return string Cleaned HTML

@see \\October\\Rain\\Html\\HtmlBuilder::clean`)
    },
    form_value: {
        name: 'form_value',
        snippet: 'form_value(${1:name}, ${2:value})',
        doc: new vscode.MarkdownString(`value is a helper for getting form values. Tries to find the old value,

then uses a postback/get value, then looks at the form model values.

@param  string $name

@param  string $value

@return string

@see \\October\\Rain\\Html\\FormBuilder::value`)
    },
    form_open: {
        name: 'form_open',
        snippet: 'form_open(${1:options})',
        doc: new vscode.MarkdownString(`open up a new HTML form and includes a session key.

@param array $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::open`)
    },
    form_ajax: {
        name: 'form_ajax',
        snippet: 'form_ajax(${1:handler}, ${2:options})',
        doc: new vscode.MarkdownString(`ajax helper for opening a form used for an AJAX call.

@param string $handler Request handler name, eg: onUpdate

@param array $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::ajax`)
    },
    form_model: {
        name: 'form_model',
        snippet: 'form_model(${1:model}, ${2:options})',
        doc: new vscode.MarkdownString(`model creates a new model based form builder.

@param  mixed  $model

@param  array  $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::model`)
    },
    form_set_model: {
        name: 'form_set_model',
        snippet: 'form_set_model(${1:model})',
        doc: new vscode.MarkdownString(`setModel instance on the form builder.

@param  mixed  $model

@return void

@see \\October\\Rain\\Html\\FormBuilder::setModel`)
    },
    form_close: {
        name: 'form_close',
        snippet: 'form_close()',
        doc: new vscode.MarkdownString(`close the current form.

@return string

@see \\October\\Rain\\Html\\FormBuilder::close`)
    },
    form_token: {
        name: 'form_token',
        snippet: 'form_token()',
        doc: new vscode.MarkdownString(`token generates a hidden field with the current CSRF token.

@return string

@see \\October\\Rain\\Html\\FormBuilder::token`)
    },
    form_label: {
        name: 'form_label',
        snippet: 'form_label(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`label creates a form label element.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::label`)
    },
    form_input: {
        name: 'form_input',
        snippet: 'form_input(${1:type}, ${2:name}, ${3:value}, ${4:options})',
        doc: new vscode.MarkdownString(`input creates a form input field.

@param  string  $type

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::input`)
    },
    form_text: {
        name: 'form_text',
        snippet: 'form_text(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`text input field.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::text`)
    },
    form_password: {
        name: 'form_password',
        snippet: 'form_password(${1:name}, ${2:options})',
        doc: new vscode.MarkdownString(`password input field.

@param  string  $name

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::password`)
    },
    form_hidden: {
        name: 'form_hidden',
        snippet: 'form_hidden(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`hidden input field.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::hidden`)
    },
    form_email: {
        name: 'form_email',
        snippet: 'form_email(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`email input field.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::email`)
    },
    form_url: {
        name: 'form_url',
        snippet: 'form_url(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`url input field.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::url`)
    },
    form_file: {
        name: 'form_file',
        snippet: 'form_file(${1:name}, ${2:options})',
        doc: new vscode.MarkdownString(`file input field.

@param  string  $name

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::file`)
    },
    form_textarea: {
        name: 'form_textarea',
        snippet: 'form_textarea(${1:name}, ${2:value}, ${3:options})',
        doc: new vscode.MarkdownString(`textarea input field.

@param  string  $name

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::textarea`)
    },
    form_select: {
        name: 'form_select',
        snippet: 'form_select(${1:name}, ${2:list}, ${3:selected}, ${4:options})',
        doc: new vscode.MarkdownString(`select box field with empty option support.

@param  string  $name

@param  array   $list

@param  string  $selected

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::select`)
    },
    form_select_range: {
        name: 'form_select_range',
        snippet: 'form_select_range(${1:name}, ${2:begin}, ${3:end}, ${4:selected}, ${5:options})',
        doc: new vscode.MarkdownString(`selectRange field.

@param  string  $name

@param  string  $begin

@param  string  $end

@param  string  $selected

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::selectRange`)
    },
    form_select_year: {
        name: 'form_select_year',
        snippet: 'form_select_year()',
        doc: new vscode.MarkdownString(`selectYear field.

@param  string  $name

@param  string  $begin

@param  string  $end

@param  string  $selected

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::selectYear`)
    },
    form_select_month: {
        name: 'form_select_month',
        snippet: 'form_select_month(${1:name}, ${2:selected}, ${3:options}, ${4:format})',
        doc: new vscode.MarkdownString(`selectMonth field.

@param  string  $name

@param  string  $selected

@param  array   $options

@param  string  $format

@return string

@see \\October\\Rain\\Html\\FormBuilder::selectMonth`)
    },
    form_get_select_option: {
        name: 'form_get_select_option',
        snippet: 'form_get_select_option(${1:display}, ${2:value}, ${3:selected})',
        doc: new vscode.MarkdownString(`getSelectOption for the given value.

@param  string  $display

@param  string  $value

@param  string  $selected

@return string

@see \\October\\Rain\\Html\\FormBuilder::getSelectOption`)
    },
    form_checkbox: {
        name: 'form_checkbox',
        snippet: 'form_checkbox(${1:name}, ${2:value}, ${3:checked}, ${4:options})',
        doc: new vscode.MarkdownString(`checkbox input field.

@param  string  $name

@param  mixed   $value

@param  bool    $checked

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::checkbox`)
    },
    form_radio: {
        name: 'form_radio',
        snippet: 'form_radio(${1:name}, ${2:value}, ${3:checked}, ${4:options})',
        doc: new vscode.MarkdownString(`radio button input field.

@param  string  $name

@param  mixed   $value

@param  bool    $checked

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::radio`)
    },
    form_reset: {
        name: 'form_reset',
        snippet: 'form_reset(${1:value}, ${2:attributes})',
        doc: new vscode.MarkdownString(`reset input element.

@param  string  $value

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\FormBuilder::reset`)
    },
    form_image: {
        name: 'form_image',
        snippet: 'form_image(${1:url}, ${2:name}, ${3:attributes})',
        doc: new vscode.MarkdownString(`image input element.

@param  string  $url

@param  string  $name

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\FormBuilder::image`)
    },
    form_submit: {
        name: 'form_submit',
        snippet: 'form_submit(${1:value}, ${2:options})',
        doc: new vscode.MarkdownString(`submit button element.

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::submit`)
    },
    form_button: {
        name: 'form_button',
        snippet: 'form_button(${1:value}, ${2:options})',
        doc: new vscode.MarkdownString(`button element.

@param  string  $value

@param  array   $options

@return string

@see \\October\\Rain\\Html\\FormBuilder::button`)
    },
    form_get_id_attribute: {
        name: 'form_get_id_attribute',
        snippet: 'form_get_id_attribute(${1:name}, ${2:attributes})',
        doc: new vscode.MarkdownString(`getIdAttribute for a field name.

@param  string  $name

@param  array   $attributes

@return string

@see \\October\\Rain\\Html\\FormBuilder::getIdAttribute`)
    },
    form_get_value_attribute: {
        name: 'form_get_value_attribute',
        snippet: 'form_get_value_attribute(${1:name}, ${2:value})',
        doc: new vscode.MarkdownString(`getValueAttribute that should be assigned to the field.

@param  string  $name

@param  string  $value

@return string

@see \\October\\Rain\\Html\\FormBuilder::getValueAttribute`)
    },
    form_old: {
        name: 'form_old',
        snippet: 'form_old(${1:name})',
        doc: new vscode.MarkdownString(`old gets a value from the session\'s old input.

@param  string  $name

@return string

@see \\October\\Rain\\Html\\FormBuilder::old`)
    },
    form_old_input_is_empty: {
        name: 'form_old_input_is_empty',
        snippet: 'form_old_input_is_empty()',
        doc: new vscode.MarkdownString(`oldInputIsEmpty determines if the old input is empty.

@return bool

@see \\October\\Rain\\Html\\FormBuilder::oldInputIsEmpty`)
    },
    form_session_key: {
        name: 'form_session_key',
        snippet: 'form_session_key(${1:session_key})',
        doc: new vscode.MarkdownString(`sessionKey returns a hidden HTML input, supplying the session key value.

@return string

@see \\October\\Rain\\Html\\FormBuilder::sessionKey`)
    },
    form_get_session_key: {
        name: 'form_get_session_key',
        snippet: 'form_get_session_key()',
        doc: new vscode.MarkdownString(`getSessionKey returns the active session key, used fr deferred bindings.

@return string

@see \\October\\Rain\\Html\\FormBuilder::getSessionKey`)
    },
    str_ordinal: {
        name: 'str_ordinal',
        snippet: 'str_ordinal(${1:number})',
        doc: new vscode.MarkdownString(`ordinal converts number to its ordinal English form

This method converts 13 to 13th, 2 to 2nd ...

@param integer $number Number to get its ordinal value

@return string Ordinal representation of given string.

@see \\October\\Rain\\Support\\Str::ordinal`)
    },
    str_normalize_eol: {
        name: 'str_normalize_eol',
        snippet: 'str_normalize_eol(${1:string})',
        doc: new vscode.MarkdownString(`normalizeEol converts line breaks to a standard \\r\\n pattern

@see \\October\\Rain\\Support\\Str::normalizeEol`)
    },
    str_normalize_class_name: {
        name: 'str_normalize_class_name',
        snippet: 'str_normalize_class_name(${1:name})',
        doc: new vscode.MarkdownString(`normalizeClassName removes the starting slash from a class namespace \\

@see \\October\\Rain\\Support\\Str::normalizeClassName`)
    },
    str_get_class_id: {
        name: 'str_get_class_id',
        snippet: 'str_get_class_id(${1:name})',
        doc: new vscode.MarkdownString(`getClassId generates a class ID from either an object or a string of the class name

@see \\October\\Rain\\Support\\Str::getClassId`)
    },
    str_get_class_namespace: {
        name: 'str_get_class_namespace',
        snippet: 'str_get_class_namespace(${1:name})',
        doc: new vscode.MarkdownString(`getClassNamespace returns a class namespace

@see \\October\\Rain\\Support\\Str::getClassNamespace`)
    },
    str_get_preceding_symbols: {
        name: 'str_get_preceding_symbols',
        snippet: 'str_get_preceding_symbols(${1:string}, ${2:symbol})',
        doc: new vscode.MarkdownString(`getPrecedingSymbols checks if $string begins with any number of consecutive symbols,

returns the number, otherwise returns 0

@see \\October\\Rain\\Support\\Str::getPrecedingSymbols`)
    },
    str_of: {
        name: 'str_of',
        snippet: 'str_of(${1:string})',
        doc: new vscode.MarkdownString(`Get a new stringable object from the given string.

@param  string  $string

@return \\Illuminate\\Support\\Stringable

@see \\Illuminate\\Support\\Str::of`)
    },
    str_after: {
        name: 'str_after',
        snippet: 'str_after(${1:subject}, ${2:search})',
        doc: new vscode.MarkdownString(`Return the remainder of a string after the first occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string

@see \\Illuminate\\Support\\Str::after`)
    },
    str_after_last: {
        name: 'str_after_last',
        snippet: 'str_after_last(${1:subject}, ${2:search})',
        doc: new vscode.MarkdownString(`Return the remainder of a string after the last occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string

@see \\Illuminate\\Support\\Str::afterLast`)
    },
    str_ascii: {
        name: 'str_ascii',
        snippet: 'str_ascii(${1:value}, ${2:language})',
        doc: new vscode.MarkdownString(`Transliterate a UTF-8 value to ASCII.

@param  string  $value

@param  string  $language

@return string

@see \\Illuminate\\Support\\Str::ascii`)
    },
    str_transliterate: {
        name: 'str_transliterate',
        snippet: 'str_transliterate(${1:string}, ${2:unknown}, ${3:strict})',
        doc: new vscode.MarkdownString(`Transliterate a string to its closest ASCII representation.

@param  string  $string

@param  string|null  $unknown

@param  bool|null  $strict

@return string

@see \\Illuminate\\Support\\Str::transliterate`)
    },
    str_before: {
        name: 'str_before',
        snippet: 'str_before(${1:subject}, ${2:search})',
        doc: new vscode.MarkdownString(`Get the portion of a string before the first occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string

@see \\Illuminate\\Support\\Str::before`)
    },
    str_before_last: {
        name: 'str_before_last',
        snippet: 'str_before_last(${1:subject}, ${2:search})',
        doc: new vscode.MarkdownString(`Get the portion of a string before the last occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string

@see \\Illuminate\\Support\\Str::beforeLast`)
    },
    str_between: {
        name: 'str_between',
        snippet: 'str_between(${1:subject}, ${2:from}, ${3:to})',
        doc: new vscode.MarkdownString(`Get the portion of a string between two given values.

@param  string  $subject

@param  string  $from

@param  string  $to

@return string

@see \\Illuminate\\Support\\Str::between`)
    },
    str_between_first: {
        name: 'str_between_first',
        snippet: 'str_between_first(${1:subject}, ${2:from}, ${3:to})',
        doc: new vscode.MarkdownString(`Get the smallest possible portion of a string between two given values.

@param  string  $subject

@param  string  $from

@param  string  $to

@return string

@see \\Illuminate\\Support\\Str::betweenFirst`)
    },
    str_camel: {
        name: 'str_camel',
        snippet: 'str_camel(${1:value})',
        doc: new vscode.MarkdownString(`Convert a value to camel case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::camel`)
    },
    str_contains: {
        name: 'str_contains',
        snippet: 'str_contains(${1:haystack}, ${2:needles}, ${3:ignore_case})',
        doc: new vscode.MarkdownString(`Determine if a given string contains a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@param  bool  $ignoreCase

@return bool

@see \\Illuminate\\Support\\Str::contains`)
    },
    str_contains_all: {
        name: 'str_contains_all',
        snippet: 'str_contains_all(${1:haystack}, ${2:needles}, ${3:ignore_case})',
        doc: new vscode.MarkdownString(`Determine if a given string contains all array values.

@param  string  $haystack

@param  iterable<string>  $needles

@param  bool  $ignoreCase

@return bool

@see \\Illuminate\\Support\\Str::containsAll`)
    },
    str_ends_with: {
        name: 'str_ends_with',
        snippet: 'str_ends_with(${1:haystack}, ${2:needles})',
        doc: new vscode.MarkdownString(`Determine if a given string ends with a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@return bool

@see \\Illuminate\\Support\\Str::endsWith`)
    },
    str_excerpt: {
        name: 'str_excerpt',
        snippet: 'str_excerpt(${1:text}, ${2:phrase}, ${3:options})',
        doc: new vscode.MarkdownString(`Extracts an excerpt from text that matches the first instance of a phrase.

@param  string  $text

@param  string  $phrase

@param  array  $options

@return string|null

@see \\Illuminate\\Support\\Str::excerpt`)
    },
    str_finish: {
        name: 'str_finish',
        snippet: 'str_finish(${1:value}, ${2:cap})',
        doc: new vscode.MarkdownString(`Cap a string with a single instance of a given value.

@param  string  $value

@param  string  $cap

@return string

@see \\Illuminate\\Support\\Str::finish`)
    },
    str_wrap: {
        name: 'str_wrap',
        snippet: 'str_wrap(${1:value}, ${2:before}, ${3:after})',
        doc: new vscode.MarkdownString(`Wrap the string with the given strings.

@param  string  $before

@param  string|null  $after

@return string

@see \\Illuminate\\Support\\Str::wrap`)
    },
    str_is: {
        name: 'str_is',
        snippet: 'str_is(${1:pattern}, ${2:value})',
        doc: new vscode.MarkdownString(`Determine if a given string matches a given pattern.

@param  string|iterable<string>  $pattern

@param  string  $value

@return bool

@see \\Illuminate\\Support\\Str::is`)
    },
    str_is_ascii: {
        name: 'str_is_ascii',
        snippet: 'str_is_ascii(${1:value})',
        doc: new vscode.MarkdownString(`Determine if a given string is 7 bit ASCII.

@param  string  $value

@return bool

@see \\Illuminate\\Support\\Str::isAscii`)
    },
    str_is_json: {
        name: 'str_is_json',
        snippet: 'str_is_json(${1:value})',
        doc: new vscode.MarkdownString(`Determine if a given string is valid JSON.

@param  string  $value

@return bool

@see \\Illuminate\\Support\\Str::isJson`)
    },
    str_is_uuid: {
        name: 'str_is_uuid',
        snippet: 'str_is_uuid(${1:value})',
        doc: new vscode.MarkdownString(`Determine if a given string is a valid UUID.

@param  string  $value

@return bool

@see \\Illuminate\\Support\\Str::isUuid`)
    },
    str_is_ulid: {
        name: 'str_is_ulid',
        snippet: 'str_is_ulid(${1:value})',
        doc: new vscode.MarkdownString(`Determine if a given string is a valid ULID.

@param  string  $value

@return bool

@see \\Illuminate\\Support\\Str::isUlid`)
    },
    str_kebab: {
        name: 'str_kebab',
        snippet: 'str_kebab(${1:value})',
        doc: new vscode.MarkdownString(`Convert a string to kebab case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::kebab`)
    },
    str_length: {
        name: 'str_length',
        snippet: 'str_length(${1:value}, ${2:encoding})',
        doc: new vscode.MarkdownString(`Return the length of the given string.

@param  string  $value

@param  string|null  $encoding

@return int

@see \\Illuminate\\Support\\Str::length`)
    },
    str_limit: {
        name: 'str_limit',
        snippet: 'str_limit(${1:value}, ${2:limit}, ${3:end})',
        doc: new vscode.MarkdownString(`Limit the number of characters in a string.

@param  string  $value

@param  int  $limit

@param  string  $end

@return string

@see \\Illuminate\\Support\\Str::limit`)
    },
    str_lower: {
        name: 'str_lower',
        snippet: 'str_lower(${1:value})',
        doc: new vscode.MarkdownString(`Convert the given string to lower-case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::lower`)
    },
    str_words: {
        name: 'str_words',
        snippet: 'str_words(${1:value}, ${2:words}, ${3:end})',
        doc: new vscode.MarkdownString(`Limit the number of words in a string.

@param  string  $value

@param  int  $words

@param  string  $end

@return string

@see \\Illuminate\\Support\\Str::words`)
    },
    str_markdown: {
        name: 'str_markdown',
        snippet: 'str_markdown(${1:string}, ${2:options})',
        doc: new vscode.MarkdownString(`Converts GitHub flavored Markdown into HTML.

@param  string  $string

@param  array  $options

@return string

@see \\Illuminate\\Support\\Str::markdown`)
    },
    str_inline_markdown: {
        name: 'str_inline_markdown',
        snippet: 'str_inline_markdown(${1:string}, ${2:options})',
        doc: new vscode.MarkdownString(`Converts inline Markdown into HTML.

@param  string  $string

@param  array  $options

@return string

@see \\Illuminate\\Support\\Str::inlineMarkdown`)
    },
    str_mask: {
        name: 'str_mask',
        snippet: 'str_mask(${1:string}, ${2:character}, ${3:index}, ${4:length}, ${5:encoding})',
        doc: new vscode.MarkdownString(`Masks a portion of a string with a repeated character.

@param  string  $string

@param  string  $character

@param  int  $index

@param  int|null  $length

@param  string  $encoding

@return string

@see \\Illuminate\\Support\\Str::mask`)
    },
    str_match: {
        name: 'str_match',
        snippet: 'str_match(${1:pattern}, ${2:subject})',
        doc: new vscode.MarkdownString(`Get the string matching the given pattern.

@param  string  $pattern

@param  string  $subject

@return string

@see \\Illuminate\\Support\\Str::match`)
    },
    str_match_all: {
        name: 'str_match_all',
        snippet: 'str_match_all(${1:pattern}, ${2:subject})',
        doc: new vscode.MarkdownString(`Get the string matching the given pattern.

@param  string  $pattern

@param  string  $subject

@return \\Illuminate\\Support\\Collection

@see \\Illuminate\\Support\\Str::matchAll`)
    },
    str_pad_both: {
        name: 'str_pad_both',
        snippet: 'str_pad_both(${1:value}, ${2:length}, ${3:pad})',
        doc: new vscode.MarkdownString(`Pad both sides of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string

@see \\Illuminate\\Support\\Str::padBoth`)
    },
    str_pad_left: {
        name: 'str_pad_left',
        snippet: 'str_pad_left(${1:value}, ${2:length}, ${3:pad})',
        doc: new vscode.MarkdownString(`Pad the left side of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string

@see \\Illuminate\\Support\\Str::padLeft`)
    },
    str_pad_right: {
        name: 'str_pad_right',
        snippet: 'str_pad_right(${1:value}, ${2:length}, ${3:pad})',
        doc: new vscode.MarkdownString(`Pad the right side of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string

@see \\Illuminate\\Support\\Str::padRight`)
    },
    str_parse_callback: {
        name: 'str_parse_callback',
        snippet: 'str_parse_callback(${1:callback}, ${2:default})',
        doc: new vscode.MarkdownString(`Parse a Class[@]method style callback into class and method.

@param  string  $callback

@param  string|null  $default

@return array<int, string|null>

@see \\Illuminate\\Support\\Str::parseCallback`)
    },
    str_plural: {
        name: 'str_plural',
        snippet: 'str_plural(${1:value}, ${2:count})',
        doc: new vscode.MarkdownString(`Get the plural form of an English word.

@param  string  $value

@param  int|array|\\Countable  $count

@return string

@see \\Illuminate\\Support\\Str::plural`)
    },
    str_plural_studly: {
        name: 'str_plural_studly',
        snippet: 'str_plural_studly(${1:value}, ${2:count})',
        doc: new vscode.MarkdownString(`Pluralize the last word of an English, studly caps case string.

@param  string  $value

@param  int|array|\\Countable  $count

@return string

@see \\Illuminate\\Support\\Str::pluralStudly`)
    },
    str_random: {
        name: 'str_random',
        snippet: 'str_random(${1:length})',
        doc: new vscode.MarkdownString(`Generate a more truly \'random\' alpha-numeric string.

@param  int  $length

@return string

@see \\Illuminate\\Support\\Str::random`)
    },
    str_create_random_strings_using: {
        name: 'str_create_random_strings_using',
        snippet: 'str_create_random_strings_using(${1:factory})',
        doc: new vscode.MarkdownString(`Set the callable that will be used to generate random strings.

@param  callable|null  $factory

@return void

@see \\Illuminate\\Support\\Str::createRandomStringsUsing`)
    },
    str_create_random_strings_using_sequence: {
        name: 'str_create_random_strings_using_sequence',
        snippet: 'str_create_random_strings_using_sequence(${1:sequence}, ${2:when_missing})',
        doc: new vscode.MarkdownString(`Set the sequence that will be used to generate random strings.

@param  array  $sequence

@param  callable|null  $whenMissing

@return void

@see \\Illuminate\\Support\\Str::createRandomStringsUsingSequence`)
    },
    str_create_random_strings_normally: {
        name: 'str_create_random_strings_normally',
        snippet: 'str_create_random_strings_normally()',
        doc: new vscode.MarkdownString(`Indicate that random strings should be created normally and not using a custom factory.

@return void

@see \\Illuminate\\Support\\Str::createRandomStringsNormally`)
    },
    str_repeat: {
        name: 'str_repeat',
        snippet: 'str_repeat(${1:string}, ${2:times})',
        doc: new vscode.MarkdownString(`Repeat the given string.

@param  string  $string

@param  int  $times

@return string

@see \\Illuminate\\Support\\Str::repeat`)
    },
    str_replace_array: {
        name: 'str_replace_array',
        snippet: 'str_replace_array(${1:search}, ${2:replace}, ${3:subject})',
        doc: new vscode.MarkdownString(`Replace a given value in the string sequentially with an array.

@param  string  $search

@param  iterable<string>  $replace

@param  string  $subject

@return string

@see \\Illuminate\\Support\\Str::replaceArray`)
    },
    str_replace: {
        name: 'str_replace',
        snippet: 'str_replace(${1:search}, ${2:replace}, ${3:subject})',
        doc: new vscode.MarkdownString(`Replace the given value in the given string.

@param  string|iterable<string>  $search

@param  string|iterable<string>  $replace

@param  string|iterable<string>  $subject

@return string

@see \\Illuminate\\Support\\Str::replace`)
    },
    str_replace_first: {
        name: 'str_replace_first',
        snippet: 'str_replace_first(${1:search}, ${2:replace}, ${3:subject})',
        doc: new vscode.MarkdownString(`Replace the first occurrence of a given value in the string.

@param  string  $search

@param  string  $replace

@param  string  $subject

@return string

@see \\Illuminate\\Support\\Str::replaceFirst`)
    },
    str_replace_last: {
        name: 'str_replace_last',
        snippet: 'str_replace_last(${1:search}, ${2:replace}, ${3:subject})',
        doc: new vscode.MarkdownString(`Replace the last occurrence of a given value in the string.

@param  string  $search

@param  string  $replace

@param  string  $subject

@return string

@see \\Illuminate\\Support\\Str::replaceLast`)
    },
    str_remove: {
        name: 'str_remove',
        snippet: 'str_remove(${1:search}, ${2:subject}, ${3:case_sensitive})',
        doc: new vscode.MarkdownString(`Remove any occurrence of the given string in the subject.

@param  string|iterable<string>  $search

@param  string  $subject

@param  bool  $caseSensitive

@return string

@see \\Illuminate\\Support\\Str::remove`)
    },
    str_reverse: {
        name: 'str_reverse',
        snippet: 'str_reverse(${1:value})',
        doc: new vscode.MarkdownString(`Reverse the given string.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::reverse`)
    },
    str_start: {
        name: 'str_start',
        snippet: 'str_start(${1:value}, ${2:prefix})',
        doc: new vscode.MarkdownString(`Begin a string with a single instance of a given value.

@param  string  $value

@param  string  $prefix

@return string

@see \\Illuminate\\Support\\Str::start`)
    },
    str_upper: {
        name: 'str_upper',
        snippet: 'str_upper(${1:value})',
        doc: new vscode.MarkdownString(`Convert the given string to upper-case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::upper`)
    },
    str_title: {
        name: 'str_title',
        snippet: 'str_title(${1:value})',
        doc: new vscode.MarkdownString(`Convert the given string to title case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::title`)
    },
    str_headline: {
        name: 'str_headline',
        snippet: 'str_headline(${1:value})',
        doc: new vscode.MarkdownString(`Convert the given string to title case for each word.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::headline`)
    },
    str_singular: {
        name: 'str_singular',
        snippet: 'str_singular(${1:value})',
        doc: new vscode.MarkdownString(`Get the singular form of an English word.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::singular`)
    },
    str_slug: {
        name: 'str_slug',
        snippet: 'str_slug(${1:title}, ${2:separator}, ${3:language}, ${4:dictionary})',
        doc: new vscode.MarkdownString(`Generate a URL friendly \'slug\' from a given string.

@param  string  $title

@param  string  $separator

@param  string|null  $language

@return string

@see \\Illuminate\\Support\\Str::slug`)
    },
    str_snake: {
        name: 'str_snake',
        snippet: 'str_snake(${1:value}, ${2:delimiter})',
        doc: new vscode.MarkdownString(`Convert a string to snake case.

@param  string  $value

@param  string  $delimiter

@return string

@see \\Illuminate\\Support\\Str::snake`)
    },
    str_squish: {
        name: 'str_squish',
        snippet: 'str_squish(${1:value})',
        doc: new vscode.MarkdownString(`Remove all \'extra\' blank space from the given string.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::squish`)
    },
    str_starts_with: {
        name: 'str_starts_with',
        snippet: 'str_starts_with(${1:haystack}, ${2:needles})',
        doc: new vscode.MarkdownString(`Determine if a given string starts with a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@return bool

@see \\Illuminate\\Support\\Str::startsWith`)
    },
    str_studly: {
        name: 'str_studly',
        snippet: 'str_studly(${1:value})',
        doc: new vscode.MarkdownString(`Convert a value to studly caps case.

@param  string  $value

@return string

@see \\Illuminate\\Support\\Str::studly`)
    },
    str_substr: {
        name: 'str_substr',
        snippet: 'str_substr(${1:string}, ${2:start}, ${3:length})',
        doc: new vscode.MarkdownString(`Returns the portion of the string specified by the start and length parameters.

@param  string  $string

@param  int  $start

@param  int|null  $length

@return string

@see \\Illuminate\\Support\\Str::substr`)
    },
    str_substr_count: {
        name: 'str_substr_count',
        snippet: 'str_substr_count(${1:haystack}, ${2:needle}, ${3:offset}, ${4:length})',
        doc: new vscode.MarkdownString(`Returns the number of substring occurrences.

@param  string  $haystack

@param  string  $needle

@param  int  $offset

@param  int|null  $length

@return int

@see \\Illuminate\\Support\\Str::substrCount`)
    },
    str_substr_replace: {
        name: 'str_substr_replace',
        snippet: 'str_substr_replace(${1:string}, ${2:replace}, ${3:offset}, ${4:length})',
        doc: new vscode.MarkdownString(`Replace text within a portion of a string.

@param  string|string[]  $string

@param  string|string[]  $replace

@param  int|int[]  $offset

@param  int|int[]|null  $length

@return string|string[]

@see \\Illuminate\\Support\\Str::substrReplace`)
    },
    str_swap: {
        name: 'str_swap',
        snippet: 'str_swap(${1:map}, ${2:subject})',
        doc: new vscode.MarkdownString(`Swap multiple keywords in a string with other keywords.

@param  array  $map

@param  string  $subject

@return string

@see \\Illuminate\\Support\\Str::swap`)
    },
    str_lcfirst: {
        name: 'str_lcfirst',
        snippet: 'str_lcfirst(${1:string})',
        doc: new vscode.MarkdownString(`Make a string\'s first character lowercase.

@param  string  $string

@return string

@see \\Illuminate\\Support\\Str::lcfirst`)
    },
    str_ucfirst: {
        name: 'str_ucfirst',
        snippet: 'str_ucfirst(${1:string})',
        doc: new vscode.MarkdownString(`Make a string\'s first character uppercase.

@param  string  $string

@return string

@see \\Illuminate\\Support\\Str::ucfirst`)
    },
    str_ucsplit: {
        name: 'str_ucsplit',
        snippet: 'str_ucsplit(${1:string})',
        doc: new vscode.MarkdownString(`Split a string into pieces by uppercase characters.

@param  string  $string

@return string[]

@see \\Illuminate\\Support\\Str::ucsplit`)
    },
    str_word_count: {
        name: 'str_word_count',
        snippet: 'str_word_count(${1:string}, ${2:characters})',
        doc: new vscode.MarkdownString(`Get the number of words a string contains.

@param  string  $string

@param  string|null  $characters

@return int

@see \\Illuminate\\Support\\Str::wordCount`)
    },
    str_uuid: {
        name: 'str_uuid',
        snippet: 'str_uuid()',
        doc: new vscode.MarkdownString(`Generate a UUID (version 4).

@return \\Ramsey\\Uuid\\UuidInterface

@see \\Illuminate\\Support\\Str::uuid`)
    },
    str_ordered_uuid: {
        name: 'str_ordered_uuid',
        snippet: 'str_ordered_uuid()',
        doc: new vscode.MarkdownString(`Generate a time-ordered UUID (version 4).

@return \\Ramsey\\Uuid\\UuidInterface

@see \\Illuminate\\Support\\Str::orderedUuid`)
    },
    str_create_uuids_using: {
        name: 'str_create_uuids_using',
        snippet: 'str_create_uuids_using(${1:factory})',
        doc: new vscode.MarkdownString(`Set the callable that will be used to generate UUIDs.

@param  callable|null  $factory

@return void

@see \\Illuminate\\Support\\Str::createUuidsUsing`)
    },
    str_create_uuids_using_sequence: {
        name: 'str_create_uuids_using_sequence',
        snippet: 'str_create_uuids_using_sequence(${1:sequence}, ${2:when_missing})',
        doc: new vscode.MarkdownString(`Set the sequence that will be used to generate UUIDs.

@param  array  $sequence

@param  callable|null  $whenMissing

@return void

@see \\Illuminate\\Support\\Str::createUuidsUsingSequence`)
    },
    str_freeze_uuids: {
        name: 'str_freeze_uuids',
        snippet: 'str_freeze_uuids(${1:callback})',
        doc: new vscode.MarkdownString(`Always return the same UUID when generating new UUIDs.

@param  \\Closure|null  $callback

@return \\Ramsey\\Uuid\\UuidInterface

@see \\Illuminate\\Support\\Str::freezeUuids`)
    },
    str_create_uuids_normally: {
        name: 'str_create_uuids_normally',
        snippet: 'str_create_uuids_normally()',
        doc: new vscode.MarkdownString(`Indicate that UUIDs should be created normally and not using a custom factory.

@return void

@see \\Illuminate\\Support\\Str::createUuidsNormally`)
    },
    str_ulid: {
        name: 'str_ulid',
        snippet: 'str_ulid()',
        doc: new vscode.MarkdownString(`Generate a ULID.

@return \\Symfony\\Component\\Uid\\Ulid

@see \\Illuminate\\Support\\Str::ulid`)
    },
    str_flush_cache: {
        name: 'str_flush_cache',
        snippet: 'str_flush_cache()',
        doc: new vscode.MarkdownString(`Remove all strings from the casing caches.

@return void

@see \\Illuminate\\Support\\Str::flushCache`)
    }
};
