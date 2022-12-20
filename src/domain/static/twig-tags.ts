import { MarkdownString } from "vscode";

export interface TwigTag {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
}

export const twigTags: { [name: string]: TwigTag } = {

    //
    // Default Twig tags
    //

    apply: {
        name: 'apply',
        snippet: 'apply ${1:filter}',
        doc: new MarkdownString(`Apply Twig filters on a block of template data

[Documentation](https://twig.symfony.com/doc/3.x/tags/apply.html)`)
    },
    endapply: {
        name: 'endapply',
        snippet: 'endapply',
        doc: new MarkdownString(`End of apply block

[Documentation](https://twig.symfony.com/doc/3.x/tags/apply.html)`)
    },
    autoescape: {
        name: 'autoescape',
        snippet: 'autoescape \'${1:type}\'',
        doc: new MarkdownString(`Apply automatic escaping on a block of template data

[Documentation](https://twig.symfony.com/doc/3.x/tags/autoescape.html)`)
    },
    endautoescape: {
        name: 'endautoescape',
        snippet: 'endautoescape',
        doc: new MarkdownString(`End of autoescape block

[Documentation](https://twig.symfony.com/doc/3.x/tags/autoescape.html)`)
    },
    cache: {
        name: 'cache',
        snippet: 'cache \'${1:key}\'',
        doc: new MarkdownString(`The cache tag tells Twig to cache a template fragment

[Documentation](https://twig.symfony.com/doc/3.x/tags/cache.html)`)
    },
    endcache: {
        name: 'endcache',
        snippet: 'endcache',
        doc: new MarkdownString(`End of cache block

[Documentation](https://twig.symfony.com/doc/3.x/tags/cache.html)`)
    },
    do: {
        name: 'do',
        snippet: 'do ${0:code}',
        doc: new MarkdownString(`The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything

[Documentation](https://twig.symfony.com/doc/3.x/tags/do.html)`)
    },
    for: {
        name: 'for',
        snippet: 'for ${1:item} in ${2:items}',
        doc: new MarkdownString(`Loop over each item in a sequence

[Documentation](https://twig.symfony.com/doc/3.x/tags/for.html)`)
    },
    endfor: {
        name: 'endfor',
        snippet: 'endfor',
        doc: new MarkdownString(`End of for block

[Documentation](https://twig.symfony.com/doc/3.x/tags/for.html)`)
    },
    if: {
        name: 'if',
        snippet: 'if ${1:condition}',
        doc: new MarkdownString(`If statement

[Documentation](https://twig.symfony.com/doc/3.x/tags/if.html)`)
    },
    endif: {
        name: 'endif',
        snippet: 'endif',
        doc: new MarkdownString(`End of if block

[Documentation](https://twig.symfony.com/doc/3.x/tags/if.html)`)
    },
    else: {
        name: 'else',
        snippet: 'else',
        doc: 'Else statement for use with \"if\" of \"for\" tags'
    },
    macro: {
        name: 'macro',
        snippet: 'macro ${1:name}(${2:params})',
        doc: new MarkdownString(`Define custom function

[Documentation](https://twig.symfony.com/doc/3.x/tags/macro.html)`)
    },
    endmacro: {
        name: 'endmacro',
        snippet: 'endmacro ${1:name}(${2:params})',
        doc: new MarkdownString(`End of macro block

[Documentation](https://twig.symfony.com/doc/3.x/tags/macro.html)`)
    },
    import: {
        name: 'import',
        snippet: 'import ${1:from} as ${2:name}',
        doc: new MarkdownString(`Import macros

[Documentation](https://twig.symfony.com/doc/3.x/tags/import.html)`)
    },
    set: {
        name: 'set',
        snippet: 'set ${1:var} = ${0:value}',
        doc: new MarkdownString(`Set variable's value

[Documentation](https://twig.symfony.com/doc/3.x/tags/set.html)`)
    },
    endset: {
        name: 'endset',
        snippet: 'endset',
        doc: new MarkdownString(`End set block

[Documentation](https://twig.symfony.com/doc/3.x/tags/set.html)`)
    },
    verbatim: {
        name: 'verbatim',
        snippet: 'verbatim',
        doc: new MarkdownString(`Verbatim tag marks sections as being raw text that should not be parsed

[Documentation](https://twig.symfony.com/doc/3.x/tags/verbatim.html)`)
    },
    endverbatim: {
        name: 'endverbatim',
        snippet: 'endverbatim',
        doc: new MarkdownString(`End of verbatim block

[Documentation](https://twig.symfony.com/doc/3.x/tags/verbatim.html)`)
    },
    with: {
        name: 'with',
        snippet: 'with ${1:variable} ${2:only}',
        doc: new MarkdownString(`Use the with tag to create a new inner scope

[Documentation](https://twig.symfony.com/doc/3.x/tags/with.html)`)
    },
    endwith: {
        name: 'endwith',
        snippet: 'endwith',
        doc: new MarkdownString(`End of with block

[Documentation](https://twig.symfony.com/doc/3.x/tags/with.html)`)
    },

    //
    // OctoberCMS Specific Twig tags
    //

    page: {
        name: 'page',
        snippet: 'page',
        doc: new MarkdownString(`Renders the contents of a page into a layout template

[Documentation](https://docs.octobercms.com/3.x/markup/tag/page.html)`)
    },
    partial: {
        name: 'partial',
        snippet: 'partial \'${1:name}\' ${2:var}',
        doc: new MarkdownString(`Render partial

[Documentation](https://docs.octobercms.com/3.x/markup/tag/partial.html)`)
    },
    endpartial: {
        name: 'endpartial',
        snippet: 'endpartial',
        doc: new MarkdownString(`End of partial block

[Documentation](https://docs.octobercms.com/3.x/markup/tag/partial.html)`)
    },
    content: {
        name: 'content',
        snippet: 'content \'${1:name}\' ${2:var}',
        doc: new MarkdownString(`Render content file

[Documentation](https://docs.octobercms.com/3.x/markup/tag/content.html)`)
    },
    component: {
        name: 'component',
        snippet: 'component \'${1:name}\' ${2:var}',
        doc: new MarkdownString(`Render component

[Documentation](https://docs.octobercms.com/3.x/markup/tag/component.html)`)
    },
    placeholder: {
        name: 'placeholder',
        snippet: 'placeholder ${1:name}',
        doc: new MarkdownString(`Render a placeholder section

[Documentation](https://docs.octobercms.com/3.x/markup/tag/placeholder.html)`)
    },
    endplaceholder: {
        name: 'endplaceholder',
        snippet: 'endplaceholder',
        doc: new MarkdownString(`End of placeholder block

[Documentation](https://docs.octobercms.com/3.x/markup/tag/placeholder.html)`)
    },
    put: {
        name: 'put',
        snippet: 'put ${1:placeholder}',
        doc: new MarkdownString(`Replace placeholder with provided content

[Documentation](https://docs.octobercms.com/3.x/markup/tag/placeholder.html)`)
    },
    endput: {
        name: 'endput',
        snippet: 'endput',
        doc: new MarkdownString(`End of put block

[Documentation](https://docs.octobercms.com/3.x/markup/tag/placeholder.html)`)
    },
    scripts: {
        name: 'scripts',
        snippet: 'scripts',
        doc: new MarkdownString(`Inserts JavaScript file references to scripts injected by the application

[Documentation](https://docs.octobercms.com/3.x/markup/tag/scripts.html)`)
    },
    styles: {
        name: 'styles',
        snippet: 'styles',
        doc: new MarkdownString(`Inserts stylesheets file references to styles injected by the application

[Documentation](https://docs.octobercms.com/3.x/markup/tag/styles.html)`)
    },
    flash: {
        name: 'flash',
        snippet: 'flash ${1:type}',
        doc: new MarkdownString(`Render any flash messages stored in the user session

[Documentation](https://docs.octobercms.com/3.x/markup/tag/flash.html)`)
    },
    endflash: {
        name: 'endflash',
        snippet: 'endflash',
        doc: new MarkdownString(`End of flash block

[Documentation](https://docs.octobercms.com/3.x/markup/tag/flash.html)`)
    },
    framework: {
        name: 'framework',
        snippet: 'framework ${1:extras}',
        doc: new MarkdownString(`Enable ajax framework

[Documentation](https://docs.octobercms.com/3.x/cms/ajax/introduction.html)`)
    }
};
