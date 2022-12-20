/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from "vscode";

export interface TwigFilter {
    name: string,
    snippet: string,
    doc?: string | vscode.MarkdownString,
}

export interface TwigFiltersList {
    [name: string]: TwigFilter
}

export const twigFilters: TwigFiltersList = {
    date: {
        name: 'date',
        snippet: 'date(${1:format}, ${2:timezone})',
        doc: new vscode.MarkdownString(`Converts a date to the given format.

{{ post.published_at|date(\"m\/d\/Y\") }}

@param \\DateTimeInterface|\\DateInterval|string $date     A date

@param string|null                             $format   The target format, null to use the default

@param \\DateTimeZone|string|false|null         $timezone The target timezone, null to use the default, false to leave unchanged

@return string The formatted date`)
    },
    date_modify: {
        name: 'date_modify',
        snippet: 'date_modify(${1:modifier})',
        doc: new vscode.MarkdownString(`Returns a new date object modified.

{{ post.published_at|date_modify(\"-1day\")|date(\"m\/d\/Y\") }}

@param \\DateTimeInterface|string $date     A date

@param string                    $modifier A modifier string

@return \\DateTimeInterface`)
    },
    format: {
        name: 'format',
        snippet: 'format(${1:values})',
        doc: new vscode.MarkdownString(`Returns a formatted string.

@param string|null $format

@param ...$values

@return string`)
    },
    replace: {
        name: 'replace',
        snippet: 'replace(${1:from})',
        doc: new vscode.MarkdownString(`Replaces strings within a string.

@param string|null        $str  String to replace in

@param array|\\Traversable $from Replace values

@return string`)
    },
    number_format: {
        name: 'number_format',
        snippet: 'number_format(${1:decimal}, ${2:decimal_point}, ${3:thousand_sep})',
        doc: new vscode.MarkdownString(`Number format filter.

All of the formatting options can be left null, in that case the defaults will

be used. Supplying any of the parameters will override the defaults set in the

environment object.

@param mixed  $number       A float\/int\/string of the number to format

@param int    $decimal      the number of decimal points to display

@param string $decimalPoint the character(s) to use for the decimal point

@param string $thousandSep  the character(s) to use for the thousands separator

@return string The formatted number`)
    },
    abs: {
        name: 'abs',
        snippet: 'abs'
    },
    round: {
        name: 'round',
        snippet: 'round(${1:precision}, ${2:method})',
        doc: new vscode.MarkdownString(`Rounds a number.

@param int|float|string|null $value     The value to round

@param int|float             $precision The rounding precision

@param string                $method    The method to use for rounding

@return int|float The rounded number`)
    },
    url_encode: {
        name: 'url_encode',
        snippet: 'url_encode',
        doc: new vscode.MarkdownString(`URL encodes (RFC 3986) a string as a path segment or an array as a query string.

@param string|array|null $url A URL or an array of query parameters

@return string The URL encoded value`)
    },
    json_encode: {
        name: 'json_encode',
        snippet: 'json_encode(${1:flags}, ${2:depth})'
    },
    convert_encoding: {
        name: 'convert_encoding',
        snippet: 'convert_encoding(${1:to}, ${2:from})',
        doc: new vscode.MarkdownString(`@param string|null $string

@param string      $to

@param string      $from

@return string`)
    },
    title: {
        name: 'title',
        snippet: 'title',
        doc: new vscode.MarkdownString(`Returns a titlecased string.

@param string|null $string A string

@return string The titlecased string`)
    },
    capitalize: {
        name: 'capitalize',
        snippet: 'capitalize',
        doc: new vscode.MarkdownString(`Returns a capitalized string.

@param string|null $string A string

@return string The capitalized string`)
    },
    upper: {
        name: 'upper',
        snippet: 'upper',
        doc: new vscode.MarkdownString(`Converts a string to uppercase.

@param string|null $string A string

@return string The uppercased string`)
    },
    lower: {
        name: 'lower',
        snippet: 'lower',
        doc: new vscode.MarkdownString(`Converts a string to lowercase.

@param string|null $string A string

@return string The lowercased string`)
    },
    striptags: {
        name: 'striptags',
        snippet: 'striptags(${1:allowable_tags})',
        doc: new vscode.MarkdownString(`Strips HTML and PHP tags from a string.

@param string|null $string

@param string[]|string|null $string

@return string`)
    },
    trim: {
        name: 'trim',
        snippet: 'trim(${1:character_mask}, ${2:side})',
        doc: new vscode.MarkdownString(`Returns a trimmed string.

@param string|null $string

@param string|null $characterMask

@param string      $side

@return string

@throws RuntimeError When an invalid trimming side is used (not a string or not 'left', 'right', or 'both'_`)
    },
    nl2br: {
        name: 'nl2br',
        snippet: 'nl2br',
        doc: new vscode.MarkdownString(`Inserts HTML line breaks before all newlines in a string.

@param string|null $string

@return string`)
    },
    spaceless: {
        name: 'spaceless',
        snippet: 'spaceless',
        doc: new vscode.MarkdownString(`Removes whitespaces between HTML tags.

@param string|null $string

@return string`)
    },
    join: {
        name: 'join',
        snippet: 'join(${1:glue}, ${2:and})',
        doc: new vscode.MarkdownString(`Joins the values to a string.

The separators between elements are empty strings per default, you can define them with the optional parameters.

{{ [1, 2, 3]|join(', ', ' and ') }}

{# returns 1, 2 and 3 #}

{{ [1, 2, 3]|join('|') }}

{# returns 1|2|3 #}

{{ [1, 2, 3]|join }}

{# returns 123 #}

@param array       $value An array

@param string      $glue  The separator

@param string|null $and   The separator for the last pair

@return string The concatenated string`)
    },
    split: {
        name: 'split',
        snippet: 'split(${1:delimiter}, ${2:limit})',
        doc: new vscode.MarkdownString(`Splits the string into an array.

{{ \"one,two,three\"|split(',') }}

{# returns [one, two, three] #}

{{ \"one,two,three,four,five\"|split(',', 3) }}

{# returns [one, two, \"three,four,five\"] #}

{{ \"123\"|split('') }}

{# returns [1, 2, 3] #}

{{ \"aabbcc\"|split('', 2) }}

{# returns [aa, bb, cc] #}

@param string|null $value     A string

@param string      $delimiter The delimiter

@param int         $limit     The limit

@return array The split string as an array`)
    },
    sort: {
        name: 'sort',
        snippet: 'sort(${1:arrow})',
        doc: new vscode.MarkdownString(`Sorts an array.

@param array|\\Traversable $array

@return array`)
    },
    merge: {
        name: 'merge',
        snippet: 'merge(${1:arr2})',
        doc: new vscode.MarkdownString(`Merges an array with another one.

{% set items = { 'apple': 'fruit', 'orange': 'fruit' } %}

{% set items = items|merge({ 'peugeot': 'car' }) %}

{# items now contains { 'apple': 'fruit', 'orange': 'fruit', 'peugeot': 'car' } #}

@param array|\\Traversable $arr1 An array

@param array|\\Traversable $arr2 An array

@return array The merged array`)
    },
    batch: {
        name: 'batch',
        snippet: 'batch(${1:size}, ${2:fill}, ${3:preserve_keys})',
        doc: new vscode.MarkdownString(`Batches item.

@param array $items An array of items

@param int   $size  The size of the batch

@param mixed $fill  A value used to fill missing items

@return array`)
    },
    column: {
        name: 'column',
        snippet: 'column(${1:name}, ${2:index})',
        doc: new vscode.MarkdownString(`Returns the values from a single column in the input array.

<pre>

{% set items = [{ 'fruit' : 'apple'}, {'fruit' : 'orange' }] %}

{% set fruits = items|column('fruit') %}

{# fruits now contains ['apple', 'orange'] #}

<\/pre>

@param array|Traversable $array An array

@param mixed             $name  The column name

@param mixed             $index The column to use as the index\/keys for the returned array

@return array The array of values`)
    },
    filter: {
        name: 'filter',
        snippet: 'filter(${1:arrow})'
    },
    map: {
        name: 'map',
        snippet: 'map(${1:arrow})'
    },
    reduce: {
        name: 'reduce',
        snippet: 'reduce(${1:arrow}, ${2:initial})'
    },
    reverse: {
        name: 'reverse',
        snippet: 'reverse(${1:preserve_keys})',
        doc: new vscode.MarkdownString(`Reverses a variable.

@param array|\\Traversable|string|null $item         An array, a \\Traversable instance, or a string

@param bool                           $preserveKeys Whether to preserve key or not

@return mixed The reversed input`)
    },
    length: {
        name: 'length',
        snippet: 'length',
        doc: new vscode.MarkdownString(`Returns the length of a variable.

@param mixed $thing A variable

@return int The length of the value`)
    },
    slice: {
        name: 'slice',
        snippet: 'slice(${1:start}, ${2:length}, ${3:preserve_keys})',
        doc: new vscode.MarkdownString(`Slices a variable.

@param mixed $item         A variable

@param int   $start        Start of the slice

@param int   $length       Size of the slice

@param bool  $preserveKeys Whether to preserve key or not (when the input is an arra)_

@return mixed The sliced variable`)
    },
    first: {
        name: 'first',
        snippet: 'first',
        doc: new vscode.MarkdownString(`Returns the first element of the item.

@param mixed $item A variable

@return mixed The first element of the item`)
    },
    last: {
        name: 'last',
        snippet: 'last',
        doc: new vscode.MarkdownString(`Returns the last element of the item.

@param mixed $item A variable

@return mixed The last element of the item`)
    },
    default: {
        name: 'default',
        snippet: 'default(${1:default})',
    },
    keys: {
        name: 'keys',
        snippet: 'keys',
        doc: new vscode.MarkdownString(`Returns the keys for the given array.

It is useful when you want to iterate over the keys of an array:

{% for key in array|keys %}

{# ... #}

{% endfor %}

@param array $array An array

@return array The keys`)
    },
    escape: {
        name: 'escape',
        snippet: 'escape(${1:strategy}, ${2:charset}, ${3:autoescape})',
        doc: new vscode.MarkdownString(`Escapes a string.

@param mixed  $string     The value to be escaped

@param string $strategy   The escaping strategy

@param string $charset    The charset

@param bool   $autoescape Whether the function is called by the auto-escaping feature (true) or by the developer (fals)_

@return string`)
    },
    e: {
        name: 'e',
        snippet: 'e(${1:strategy}, ${2:charset}, ${3:autoescape})',
        doc: new vscode.MarkdownString(`Escapes a string.

@param mixed  $string     The value to be escaped

@param string $strategy   The escaping strategy

@param string $charset    The charset

@param bool   $autoescape Whether the function is called by the auto-escaping feature (true) or by the developer (fals)_

@return string`)
    },
    raw: {
        name: 'raw',
        snippet: 'raw',
        doc: new vscode.MarkdownString(`Marks a variable as being safe.

@param string $string A PHP variable`)
    },
    app: {
        name: 'app',
        snippet: 'app',
        doc: `new vscode.MarkdownString(appFilter converts supplied URL to one relative to the website root.

@param mixed $url Specifies the application-relative URL

@return string)`
    },
    resize: {
        name: 'resize',
        snippet: 'resize(${1:width}, ${2:height}, ${3:options})',
        doc: `new vscode.MarkdownString(resizeFilter converts supplied input into a URL that will return the desired resized image.

The image can be either a file model, absolute path, or URL.)`
    },
    trans: {
        name: 'trans',
        snippet: 'trans(${1:replace}, ${2:locale})',
        doc: new vscode.MarkdownString(`Translate the given message.

@param  string|null  $key

@param  array  $replace

@param  string|null  $locale

@return string|array|null`)
    },
    trans_choice: {
        name: 'trans_choice',
        snippet: 'trans_choice(${1:number}, ${2:replace}, ${3:locale})',
        doc: new vscode.MarkdownString(`Translates the given message based on a count.

@param  string  $key

@param  \\Countable|int|array  $number

@param  array  $replace

@param  string|null  $locale

@return string`)
    },
    _: {
        name: '_',
        snippet: '_(${1:replace}, ${2:locale})',
        doc: new vscode.MarkdownString(`Translate the given message.

@param  string|null  $key

@param  array  $replace

@param  string|null  $locale

@return string|array|null`)
    },
    __: {
        name: '__',
        snippet: '__(${1:number}, ${2:replace}, ${3:locale})',
        doc: new vscode.MarkdownString(`Translates the given message based on a count.

@param  string  $key

@param  \\Countable|int|array  $number

@param  array  $replace

@param  string|null  $locale

@return string`)
    },
    transchoice: {
        name: 'transchoice',
        snippet: 'transchoice(${1:number}, ${2:replace}, ${3:locale})',
        doc: new vscode.MarkdownString(`Translates the given message based on a count.

@param  string  $key

@param  \\Countable|int|array  $number

@param  array  $replace

@param  string|null  $locale

@return string`)
    },
    str_replace: {
        name: 'str_replace',
        snippet: 'str_replace(${1:replace}, ${2:subject})',
        doc: new vscode.MarkdownString(`Replace the given value in the given string.

@param  string|iterable<string>  $search

@param  string|iterable<string>  $replace

@param  string|iterable<string>  $subject

@return string`)
    },
    str_replace_first: {
        name: 'str_replace_first',
        snippet: 'str_replace_first(${1:replace}, ${2:subject})',
        doc: new vscode.MarkdownString(`Replace the first occurrence of a given value in the string.

@param  string  $search

@param  string  $replace

@param  string  $subject

@return string`)
    },
    str_replace_last: {
        name: 'str_replace_last',
        snippet: 'str_replace_last(${1:replace}, ${2:subject})',
        doc: new vscode.MarkdownString(`Replace the last occurrence of a given value in the string.

@param  string  $search

@param  string  $replace

@param  string  $subject

@return string`)
    },
    str_replace_array: {
        name: 'str_replace_array',
        snippet: 'str_replace_array(${1:replace}, ${2:subject})',
        doc: new vscode.MarkdownString(`Replace a given value in the string sequentially with an array.

@param  string  $search

@param  iterable<string>  $replace

@param  string  $subject

@return string`)
    },
    slug: {
        name: 'slug',
        snippet: 'slug'
    },
    plural: {
        name: 'plural',
        snippet: 'plural'
    },
    singular: {
        name: 'singular',
        snippet: 'singular'
    },
    finish: {
        name: 'finish',
        snippet: 'finish'
    },
    snake: {
        name: 'snake',
        snippet: 'snake'
    },
    camel: {
        name: 'camel',
        snippet: 'camel'
    },
    studly: {
        name: 'studly',
        snippet: 'studly'
    },
    md: {
        name: 'md',
        snippet: 'md'
    },
    md_safe: {
        name: 'md_safe',
        snippet: 'md_safe'
    },
    md_clean: {
        name: 'md_clean',
        snippet: 'md_clean'
    },
    md_indent: {
        name: 'md_indent',
        snippet: 'md_indent'
    },
    time_since: {
        name: 'time_since',
        snippet: 'time_since'
    },
    time_tense: {
        name: 'time_tense',
        snippet: 'time_tense'
    },
    media: {
        name: 'media',
        snippet: 'media'
    },
    page: {
        name: 'page',
        snippet: 'page()',
        doc: new vscode.MarkdownString(`Creates a link to a page using a page file name.`)
    },
    theme: {
        name: 'theme',
        snippet: 'theme',
        doc: new vscode.MarkdownString(`Returns an address relative to the active theme path of the website.`)
    },
    html_entities: {
        name: 'html_entities',
        snippet: 'html_entities()',
        doc: new vscode.MarkdownString(`entities converts an HTML string to entities.

@param  string  $value

@return string`)
    },
    html_decode: {
        name: 'html_decode',
        snippet: 'html_decode()',
        doc: new vscode.MarkdownString(`decode converts entities to HTML characters.

@param  string  $value

@return string`)
    },
    html_script: {
        name: 'html_script',
        snippet: 'html_script(${1:attributes}, ${2:secure})',
        doc: new vscode.MarkdownString(`script generates a link to a JavaScript file.

@param  string  $url

@param  array   $attributes

@param  bool    $secure

@return string`)
    },
    html_style: {
        name: 'html_style',
        snippet: 'html_style(${1:attributes}, ${2:secure})',
        doc: new vscode.MarkdownString(`style generates a link to a CSS file.

@param  string  $url

@param  array   $attributes

@param  bool    $secure

@return string`)
    },
    html_image: {
        name: 'html_image',
        snippet: 'html_image(${1:alt}, ${2:attributes}, ${3:secure})',
        doc: new vscode.MarkdownString(`image generates an HTML image element.

@param  string  $url

@param  string  $alt

@param  array   $attributes

@param  bool    $secure

@return string`)
    },
    html_link: {
        name: 'html_link',
        snippet: 'html_link(${1:title}, ${2:attributes}, ${3:secure})',
        doc: new vscode.MarkdownString(`link generates a HTML link.

@param  string  $url

@param  string  $title

@param  array   $attributes

@param  bool    $secure

@return string`)
    },
    html_secure_link: {
        name: 'html_secure_link',
        snippet: 'html_secure_link(${1:title}, ${2:attributes})',
        doc: `new vscode.MarkdownString(secureLink generates a HTTPS HTML link.

@param  string  $url

@param  string  $title

@param  array   $attributes

@return string)`
    },
    html_link_asset: {
        name: 'html_link_asset',
        snippet: 'html_link_asset(${1:title}, ${2:attributes}, ${3:secure})',
        doc: `new vscode.MarkdownString(linkAsset generates a HTML link to an asset.

@param  string  $url

@param  string  $title

@param  array   $attributes

@param  bool    $secure

@return string)`
    },
    html_link_secure_asset: {
        name: 'html_link_secure_asset',
        snippet: 'html_link_secure_asset(${1:title}, ${2:attributes})',
        doc: `new vscode.MarkdownString(linkSecureAsset generates a HTTPS HTML link to an asset.

@param  string  $url

@param  string  $title

@param  array   $attributes

@return string)`
    },
    html_link_route: {
        name: 'html_link_route',
        snippet: 'html_link_route(${1:title}, ${2:parameters}, ${3:attributes})',
        doc: `new vscode.MarkdownString(linkRoute generates a HTML link to a named route.

@param  string  $name

@param  string  $title

@param  array   $parameters

@param  array   $attributes

@return string)`
    },
    html_link_action: {
        name: 'html_link_action',
        snippet: 'html_link_action(${1:title}, ${2:parameters}, ${3:attributes})',
        doc: `new vscode.MarkdownString(linkAction generates a HTML link to a controller action.

@param  string  $action

@param  string  $title

@param  array   $parameters

@param  array   $attributes

@return string)`
    },
    html_mailto: {
        name: 'html_mailto',
        snippet: 'html_mailto(${1:title}, ${2:attributes})',
        doc: new vscode.MarkdownString(`mailto generates a HTML link to an email address.

@param  string  $email

@param  string  $title

@param  array   $attributes

@return string`)
    },
    html_email: {
        name: 'html_email',
        snippet: 'html_email()',
        doc: new vscode.MarkdownString(`email obfuscates an e-mail address to prevent spam-bots from sniffing it.

@param  string  $email

@return string`)
    },
    html_ol: {
        name: 'html_ol',
        snippet: 'html_ol(${1:attributes})',
        doc: new vscode.MarkdownString(`ol generate an ordered list of items.

@param  array   $list

@param  array   $attributes

@return string`)
    },
    html_ul: {
        name: 'html_ul',
        snippet: 'html_ul(${1:attributes})',
        doc: new vscode.MarkdownString(`ul generates an un-ordered list of items.

@param  array   $list

@param  array   $attributes

@return string`)
    },
    html_attributes: {
        name: 'html_attributes',
        snippet: 'html_attributes()',
        doc: new vscode.MarkdownString(`Build an HTML attribute string from an array.

@param  array  $attributes

@return string`)
    },
    html_obfuscate: {
        name: 'html_obfuscate',
        snippet: 'html_obfuscate()',
        doc: new vscode.MarkdownString(`obfuscate a string to prevent spam-bots from sniffing it.

@param  string  $value

@return string`)
    },
    html_strip: {
        name: 'html_strip',
        snippet: 'html_strip(${1:allow})',
        doc: new vscode.MarkdownString(`strip removes HTML from a string, with allowed tags, e.g. <p>

@param $string

@param $allow

@return string`)
    },
    html_limit: {
        name: 'html_limit',
        snippet: 'html_limit(${1:max_length}, ${2:end})',
        doc: new vscode.MarkdownString(`limit HTML with specific length with a proper tag handling.

@param string $html HTML string to limit

@param int $maxLength String length to truncate at

@param  string  $end

@return string`)
    },
    html_minify: {
        name: 'html_minify',
        snippet: 'html_minify()',
        doc: new vscode.MarkdownString(`minify makes HTML more compact`)
    },
    html_clean: {
        name: 'html_clean',
        snippet: 'html_clean()',
        doc: new vscode.MarkdownString(`clean HTML to prevent most XSS attacks.

@param  string $html HTML

@return string Cleaned HTML`)
    },
    str_ordinal: {
        name: 'str_ordinal',
        snippet: 'str_ordinal()',
        doc: new vscode.MarkdownString(`ordinal converts number to its ordinal English form

This method converts 13 to 13th, 2 to 2nd ...

@param integer $number Number to get its ordinal value

@return string Ordinal representation of given string.`)
    },
    str_normalize_eol: {
        name: 'str_normalize_eol',
        snippet: 'str_normalize_eol()',
        doc: `new vscode.MarkdownString(normalizeEol converts line breaks to a standard \\r\
 pattern)`
    },
    str_normalize_class_name: {
        name: 'str_normalize_class_name',
        snippet: 'str_normalize_class_name()',
        doc: `new vscode.MarkdownString(normalizeClassName removes the starting slash from a class namespace \\)`
    },
    str_get_class_id: {
        name: 'str_get_class_id',
        snippet: 'str_get_class_id()',
        doc: `new vscode.MarkdownString(getClassId generates a class ID from either an object or a string of the class name)`
    },
    str_get_class_namespace: {
        name: 'str_get_class_namespace',
        snippet: 'str_get_class_namespace()',
        doc: `new vscode.MarkdownString(getClassNamespace returns a class namespace)`
    },
    str_get_preceding_symbols: {
        name: 'str_get_preceding_symbols',
        snippet: 'str_get_preceding_symbols(${1:symbol})',
        doc: `new vscode.MarkdownString(getPrecedingSymbols checks if $string begins with any number of consecutive symbols,

returns the number, otherwise returns 0)`
    },
    str_of: {
        name: 'str_of',
        snippet: 'str_of()',
        doc: new vscode.MarkdownString(`Get a new stringable object from the given string.

@param  string  $string

@return \\Illuminate\\Support\\Stringable`)
    },
    str_after: {
        name: 'str_after',
        snippet: 'str_after(${1:search})',
        doc: new vscode.MarkdownString(`Return the remainder of a string after the first occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string`)
    },
    str_after_last: {
        name: 'str_after_last',
        snippet: 'str_after_last(${1:search})',
        doc: new vscode.MarkdownString(`Return the remainder of a string after the last occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string`)
    },
    str_ascii: {
        name: 'str_ascii',
        snippet: 'str_ascii(${1:language})',
        doc: new vscode.MarkdownString(`Transliterate a UTF-8 value to ASCII.

@param  string  $value

@param  string  $language

@return string`)
    },
    str_transliterate: {
        name: 'str_transliterate',
        snippet: 'str_transliterate(${1:unknown}, ${2:strict})',
        doc: new vscode.MarkdownString(`Transliterate a string to its closest ASCII representation.

@param  string  $string

@param  string|null  $unknown

@param  bool|null  $strict

@return string`)
    },
    str_before: {
        name: 'str_before',
        snippet: 'str_before(${1:search})',
        doc: new vscode.MarkdownString(`Get the portion of a string before the first occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string`)
    },
    str_before_last: {
        name: 'str_before_last',
        snippet: 'str_before_last(${1:search})',
        doc: new vscode.MarkdownString(`Get the portion of a string before the last occurrence of a given value.

@param  string  $subject

@param  string  $search

@return string`)
    },
    str_between: {
        name: 'str_between',
        snippet: 'str_between(${1:from}, ${2:to})',
        doc: new vscode.MarkdownString(`Get the portion of a string between two given values.

@param  string  $subject

@param  string  $from

@param  string  $to

@return string`)
    },
    str_between_first: {
        name: 'str_between_first',
        snippet: 'str_between_first(${1:from}, ${2:to})',
        doc: new vscode.MarkdownString(`Get the smallest possible portion of a string between two given values.

@param  string  $subject

@param  string  $from

@param  string  $to

@return string`)
    },
    str_camel: {
        name: 'str_camel',
        snippet: 'str_camel()',
        doc: new vscode.MarkdownString(`Convert a value to camel case.

@param  string  $value

@return string`)
    },
    str_contains: {
        name: 'str_contains',
        snippet: 'str_contains(${1:needles}, ${2:ignore_case})',
        doc: new vscode.MarkdownString(`Determine if a given string contains a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@param  bool  $ignoreCase

@return bool`)
    },
    str_contains_all: {
        name: 'str_contains_all',
        snippet: 'str_contains_all(${1:needles}, ${2:ignore_case})',
        doc: new vscode.MarkdownString(`Determine if a given string contains all array values.

@param  string  $haystack

@param  iterable<string>  $needles

@param  bool  $ignoreCase

@return bool`)
    },
    str_ends_with: {
        name: 'str_ends_with',
        snippet: 'str_ends_with(${1:needles})',
        doc: new vscode.MarkdownString(`Determine if a given string ends with a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@return bool`)
    },
    str_excerpt: {
        name: 'str_excerpt',
        snippet: 'str_excerpt(${1:phrase}, ${2:options})',
        doc: new vscode.MarkdownString(`Extracts an excerpt from text that matches the first instance of a phrase.

@param  string  $text

@param  string  $phrase

@param  array  $options

@return string|null`)
    },
    str_finish: {
        name: 'str_finish',
        snippet: 'str_finish(${1:cap})',
        doc: new vscode.MarkdownString(`Cap a string with a single instance of a given value.

@param  string  $value

@param  string  $cap

@return string`)
    },
    str_wrap: {
        name: 'str_wrap',
        snippet: 'str_wrap(${1:before}, ${2:after})',
        doc: new vscode.MarkdownString(`Wrap the string with the given strings.

@param  string  $before

@param  string|null  $after

@return string`)
    },
    str_is: {
        name: 'str_is',
        snippet: 'str_is(${1:value})',
        doc: new vscode.MarkdownString(`Determine if a given string matches a given pattern.

@param  string|iterable<string>  $pattern

@param  string  $value

@return bool`)
    },
    str_is_ascii: {
        name: 'str_is_ascii',
        snippet: 'str_is_ascii()',
        doc: new vscode.MarkdownString(`Determine if a given string is 7 bit ASCII.

@param  string  $value

@return bool`)
    },
    str_is_json: {
        name: 'str_is_json',
        snippet: 'str_is_json()',
        doc: new vscode.MarkdownString(`Determine if a given string is valid JSON.

@param  string  $value

@return bool`)
    },
    str_is_uuid: {
        name: 'str_is_uuid',
        snippet: 'str_is_uuid()',
        doc: new vscode.MarkdownString(`Determine if a given string is a valid UUID.

@param  string  $value

@return bool`)
    },
    str_is_ulid: {
        name: 'str_is_ulid',
        snippet: 'str_is_ulid()',
        doc: new vscode.MarkdownString(`Determine if a given string is a valid ULID.

@param  string  $value

@return bool`)
    },
    str_kebab: {
        name: 'str_kebab',
        snippet: 'str_kebab()',
        doc: new vscode.MarkdownString(`Convert a string to kebab case.

@param  string  $value

@return string`)
    },
    str_length: {
        name: 'str_length',
        snippet: 'str_length(${1:encoding})',
        doc: new vscode.MarkdownString(`Return the length of the given string.

@param  string  $value

@param  string|null  $encoding

@return int`)
    },
    str_limit: {
        name: 'str_limit',
        snippet: 'str_limit(${1:limit}, ${2:end})',
        doc: new vscode.MarkdownString(`Limit the number of characters in a string.

@param  string  $value

@param  int  $limit

@param  string  $end

@return string`)
    },
    str_lower: {
        name: 'str_lower',
        snippet: 'str_lower()',
        doc: new vscode.MarkdownString(`Convert the given string to lower-case.

@param  string  $value

@return string`)
    },
    str_words: {
        name: 'str_words',
        snippet: 'str_words(${1:words}, ${2:end})',
        doc: new vscode.MarkdownString(`Limit the number of words in a string.

@param  string  $value

@param  int  $words

@param  string  $end

@return string`)
    },
    str_markdown: {
        name: 'str_markdown',
        snippet: 'str_markdown(${1:options})',
        doc: new vscode.MarkdownString(`Converts GitHub flavored Markdown into HTML.

@param  string  $string

@param  array  $options

@return string`)
    },
    str_inline_markdown: {
        name: 'str_inline_markdown',
        snippet: 'str_inline_markdown(${1:options})',
        doc: new vscode.MarkdownString(`Converts inline Markdown into HTML.

@param  string  $string

@param  array  $options

@return string`)
    },
    str_mask: {
        name: 'str_mask',
        snippet: 'str_mask(${1:character}, ${2:index}, ${3:length}, ${4:encoding})',
        doc: new vscode.MarkdownString(`Masks a portion of a string with a repeated character.

@param  string  $string

@param  string  $character

@param  int  $index

@param  int|null  $length

@param  string  $encoding

@return string`)
    },
    str_match: {
        name: 'str_match',
        snippet: 'str_match(${1:subject})',
        doc: new vscode.MarkdownString(`Get the string matching the given pattern.

@param  string  $pattern

@param  string  $subject

@return string`)
    },
    str_match_all: {
        name: 'str_match_all',
        snippet: 'str_match_all(${1:subject})',
        doc: new vscode.MarkdownString(`Get the string matching the given pattern.

@param  string  $pattern

@param  string  $subject

@return \\Illuminate\\Support\\Collection`)
    },
    str_pad_both: {
        name: 'str_pad_both',
        snippet: 'str_pad_both(${1:length}, ${2:pad})',
        doc: new vscode.MarkdownString(`Pad both sides of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string`)
    },
    str_pad_left: {
        name: 'str_pad_left',
        snippet: 'str_pad_left(${1:length}, ${2:pad})',
        doc: new vscode.MarkdownString(`Pad the left side of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string`)
    },
    str_pad_right: {
        name: 'str_pad_right',
        snippet: 'str_pad_right(${1:length}, ${2:pad})',
        doc: new vscode.MarkdownString(`Pad the right side of a string with another.

@param  string  $value

@param  int  $length

@param  string  $pad

@return string`)
    },
    str_parse_callback: {
        name: 'str_parse_callback',
        snippet: 'str_parse_callback(${1:default})',
        doc: new vscode.MarkdownString(`Parse a Class[@]method style callback into class and method.

@param  string  $callback

@param  string|null  $default

@return array<int, string|null>`)
    },
    str_plural: {
        name: 'str_plural',
        snippet: 'str_plural(${1:count})',
        doc: new vscode.MarkdownString(`Get the plural form of an English word.

@param  string  $value

@param  int|array|\\Countable  $count

@return string`)
    },
    str_plural_studly: {
        name: 'str_plural_studly',
        snippet: 'str_plural_studly(${1:count})',
        doc: new vscode.MarkdownString(`Pluralize the last word of an English, studly caps case string.

@param  string  $value

@param  int|array|\\Countable  $count

@return string`)
    },
    str_random: {
        name: 'str_random',
        snippet: 'str_random()',
        doc: new vscode.MarkdownString(`Generate a more truly \"random\" alpha-numeric string.

@param  int  $length

@return string`)
    },
    str_create_random_strings_using: {
        name: 'str_create_random_strings_using',
        snippet: 'str_create_random_strings_using()',
        doc: new vscode.MarkdownString(`Set the callable that will be used to generate random strings.

@param  callable|null  $factory

@return void`)
    },
    str_create_random_strings_using_sequence: {
        name: 'str_create_random_strings_using_sequence',
        snippet: 'str_create_random_strings_using_sequence(${1:when_missing})',
        doc: new vscode.MarkdownString(`Set the sequence that will be used to generate random strings.

@param  array  $sequence

@param  callable|null  $whenMissing

@return void`)
    },
    str_create_random_strings_normally: {
        name: 'str_create_random_strings_normally',
        snippet: 'str_create_random_strings_normally()',
        doc: new vscode.MarkdownString(`Indicate that random strings should be created normally and not using a custom factory.

@return void`)
    },
    str_repeat: {
        name: 'str_repeat',
        snippet: 'str_repeat(${1:times})',
        doc: new vscode.MarkdownString(`Repeat the given string.

@param  string  $string

@param  int  $times

@return string`)
    },
    str_remove: {
        name: 'str_remove',
        snippet: 'str_remove(${1:subject}, ${2:case_sensitive})',
        doc: new vscode.MarkdownString(`Remove any occurrence of the given string in the subject.

@param  string|iterable<string>  $search

@param  string  $subject

@param  bool  $caseSensitive

@return string`)
    },
    str_reverse: {
        name: 'str_reverse',
        snippet: 'str_reverse()',
        doc: new vscode.MarkdownString(`Reverse the given string.

@param  string  $value

@return string`)
    },
    str_start: {
        name: 'str_start',
        snippet: 'str_start(${1:prefix})',
        doc: new vscode.MarkdownString(`Begin a string with a single instance of a given value.

@param  string  $value

@param  string  $prefix

@return string`)
    },
    str_upper: {
        name: 'str_upper',
        snippet: 'str_upper()',
        doc: new vscode.MarkdownString(`Convert the given string to upper-case.

@param  string  $value

@return string`)
    },
    str_title: {
        name: 'str_title',
        snippet: 'str_title()',
        doc: new vscode.MarkdownString(`Convert the given string to title case.

@param  string  $value

@return string`)
    },
    str_headline: {
        name: 'str_headline',
        snippet: 'str_headline()',
        doc: new vscode.MarkdownString(`Convert the given string to title case for each word.

@param  string  $value

@return string`)
    },
    str_singular: {
        name: 'str_singular',
        snippet: 'str_singular()',
        doc: new vscode.MarkdownString(`Get the singular form of an English word.

@param  string  $value

@return string`)
    },
    str_slug: {
        name: 'str_slug',
        snippet: 'str_slug(${1:separator}, ${2:language}, ${3:dictionary})',
        doc: new vscode.MarkdownString(`Generate a URL friendly \"slug\" from a given string.

@param  string  $title

@param  string  $separator

@param  string|null  $language

@return string`)
    },
    str_snake: {
        name: 'str_snake',
        snippet: 'str_snake(${1:delimiter})',
        doc: new vscode.MarkdownString(`Convert a string to snake case.

@param  string  $value

@param  string  $delimiter

@return string`)
    },
    str_squish: {
        name: 'str_squish',
        snippet: 'str_squish()',
        doc: new vscode.MarkdownString(`Remove all \"extra\" blank space from the given string.

@param  string  $value

@return string`)
    },
    str_starts_with: {
        name: 'str_starts_with',
        snippet: 'str_starts_with(${1:needles})',
        doc: new vscode.MarkdownString(`Determine if a given string starts with a given substring.

@param  string  $haystack

@param  string|iterable<string>  $needles

@return bool`)
    },
    str_studly: {
        name: 'str_studly',
        snippet: 'str_studly()',
        doc: new vscode.MarkdownString(`Convert a value to studly caps case.

@param  string  $value

@return string`)
    },
    str_substr: {
        name: 'str_substr',
        snippet: 'str_substr(${1:start}, ${2:length})',
        doc: new vscode.MarkdownString(`Returns the portion of the string specified by the start and length parameters.

@param  string  $string

@param  int  $start

@param  int|null  $length

@return string`)
    },
    str_substr_count: {
        name: 'str_substr_count',
        snippet: 'str_substr_count(${1:needle}, ${2:offset}, ${3:length})',
        doc: new vscode.MarkdownString(`Returns the number of substring occurrences.

@param  string  $haystack

@param  string  $needle

@param  int  $offset

@param  int|null  $length

@return int`)
    },
    str_substr_replace: {
        name: 'str_substr_replace',
        snippet: 'str_substr_replace(${1:replace}, ${2:offset}, ${3:length})',
        doc: new vscode.MarkdownString(`Replace text within a portion of a string.

@param  string|string[]  $string

@param  string|string[]  $replace

@param  int|int[]  $offset

@param  int|int[]|null  $length

@return string|string[_`)
    },
    str_swap: {
        name: 'str_swap',
        snippet: 'str_swap(${1:subject})',
        doc: new vscode.MarkdownString(`Swap multiple keywords in a string with other keywords.

@param  array  $map

@param  string  $subject

@return string`)
    },
    str_lcfirst: {
        name: 'str_lcfirst',
        snippet: 'str_lcfirst()',
        doc: new vscode.MarkdownString(`Make a string's first character lowercase.

@param  string  $string

@return string`)
    },
    str_ucfirst: {
        name: 'str_ucfirst',
        snippet: 'str_ucfirst()',
        doc: new vscode.MarkdownString(`Make a string's first character uppercase.

@param  string  $string

@return string`)
    },
    str_ucsplit: {
        name: 'str_ucsplit',
        snippet: 'str_ucsplit()',
        doc: new vscode.MarkdownString(`Split a string into pieces by uppercase characters.

@param  string  $string

@return string[_`)
    },
    str_word_count: {
        name: 'str_word_count',
        snippet: 'str_word_count(${1:characters})',
        doc: new vscode.MarkdownString(`Get the number of words a string contains.

@param  string  $string

@param  string|null  $characters

@return int`)
    },
    str_uuid: {
        name: 'str_uuid',
        snippet: 'str_uuid()',
        doc: new vscode.MarkdownString(`Generate a UUID (version 4).

@return \\Ramsey\\Uuid\\UuidInterface`)
    },
    str_ordered_uuid: {
        name: 'str_ordered_uuid',
        snippet: 'str_ordered_uuid()',
        doc: new vscode.MarkdownString(`Generate a time-ordered UUID (version 4).

@return \\Ramsey\\Uuid\\UuidInterface`)
    },
    str_create_uuids_using: {
        name: 'str_create_uuids_using',
        snippet: 'str_create_uuids_using()',
        doc: new vscode.MarkdownString(`Set the callable that will be used to generate UUIDs.

@param  callable|null  $factory

@return void`)
    },
    str_create_uuids_using_sequence: {
        name: 'str_create_uuids_using_sequence',
        snippet: 'str_create_uuids_using_sequence(${1:when_missing})',
        doc: new vscode.MarkdownString(`Set the sequence that will be used to generate UUIDs.

@param  array  $sequence

@param  callable|null  $whenMissing

@return void`)
    },
    str_freeze_uuids: {
        name: 'str_freeze_uuids',
        snippet: 'str_freeze_uuids()',
        doc: new vscode.MarkdownString(`Always return the same UUID when generating new UUIDs.

@param  \\Closure|null  $callback

@return \\Ramsey\\Uuid\\UuidInterface`)
    },
    str_create_uuids_normally: {
        name: 'str_create_uuids_normally',
        snippet: 'str_create_uuids_normally()',
        doc: new vscode.MarkdownString(`Indicate that UUIDs should be created normally and not using a custom factory.

@return void`)
    },
    str_ulid: {
        name: 'str_ulid',
        snippet: 'str_ulid()',
        doc: new vscode.MarkdownString(`Generate a ULID.

@return \\Symfony\\Component\\Uid\\Ulid`)
    },
    str_flush_cache: {
        name: 'str_flush_cache',
        snippet: 'str_flush_cache()',
        doc: new vscode.MarkdownString(`Remove all strings from the casing caches.

@return void`)
    },
    url_current: {
        name: 'url_current',
        snippet: 'url_current()',
        doc: new vscode.MarkdownString(`Get the current URL for the request.

@return string`)
    },
    url_previous: {
        name: 'url_previous',
        snippet: 'url_previous()',
        doc: new vscode.MarkdownString(`Get the URL for the previous request.

@param  mixed  $fallback

@return string`)
    },
    url_to: {
        name: 'url_to',
        snippet: 'url_to(${1:extra}, ${2:secure})',
        doc: new vscode.MarkdownString(`Generate an absolute URL to the given path.

@param  string  $path

@param  mixed  $extra

@param  bool|null  $secure

@return string`)
    },
    url_secure: {
        name: 'url_secure',
        snippet: 'url_secure(${1:parameters})',
        doc: new vscode.MarkdownString(`Generate a secure, absolute URL to the given path.

@param  string  $path

@param  array  $parameters

@return string`)
    },
    url_asset: {
        name: 'url_asset',
        snippet: 'url_asset(${1:secure})',
        doc: new vscode.MarkdownString(`Generate the URL to an application asset.

@param  string  $path

@param  bool|null  $secure

@return string`)
    },
    url_route: {
        name: 'url_route',
        snippet: 'url_route(${1:parameters}, ${2:absolute})',
        doc: new vscode.MarkdownString(`Get the URL to a named route.

@param  string  $name

@param  mixed  $parameters

@param  bool  $absolute

@return string

@throws \\InvalidArgumentException`)
    },
    url_action: {
        name: 'url_action',
        snippet: 'url_action(${1:parameters}, ${2:absolute})',
        doc: new vscode.MarkdownString(`Get the URL to a controller action.

@param  string|array  $action

@param  mixed  $parameters

@param  bool  $absolute

@return string`)
    }
};
