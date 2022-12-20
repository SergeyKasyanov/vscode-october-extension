# October Code

**October Code** helps you with development of projects based on October CMS by providing many features, such as **code completions**, **code generation**, simplifies **code navigation** and more.

## Features

### For theme developers

* **formatting** of theme files
* **completions of theme file names**: layouts, pages, partials, content files
* **twig completions**: variables, tags, functions, filters including custom things defined in october plugins
* **ini section completions**: properties related to file type, components names and their properties
* **partials and content variables completions** in {% partial ... %} and {% content ... %} twig tags
* **ajax methods** of current file and used components in data-request html attribute and js request methods
* **diagnostics** of not existing theme files and quick fixes to create them
* **extract partial** code action
* **code lenses** for quickly find partials, content files and layouts usages
* and more...

### For plugin developers

* configurable **code generators** for controllers, models, commands, migrations, widgets and more...
* **yaml config validation and completions** based on json schemas
* completions of **model attributes**, **model classes**, **models scopes**, **model getFieldNameOptions**, **config path** and **partials path** in yaml configs
* completions of **permission codes**, **mail templates**, **validation rules**, **config and env keys**
* simplified code navigation by **go to model**, **go to controller** and **go to related file** commands
* document links for **partials**, **configs** and **model classes** in yaml configs and php files
* and more...

## Requirements

October Code requires **redhat.vscode-yaml** extension to be installed for validate and autocomplete yaml configs based on provided json schemas.

## Configuring VS Code

For better file associations it is recommended to add following lines to your vscode config file:

```json
"files.associations": {
    "**/themes/**/*.htm": "october-tpl",
    "**/plugins/**/*.htm": "php"
},
```

For better code folding ranges add this:

```json
"[october-tpl]": {
    "editor.defaultFoldingRangeProvider": "SergeyKasyanov.october-code"
}
```

For emmet to work in theme files, add this to config:

```json
"emmet.includeLanguages": {
    "october-tpl": "html"
},
```

If you use **IntelliSense for CSS class names in HTML** (Zignd.html-css-class-completion) add `october-tpl` to `html-css-class-completion.HTMLLanguages`

```json
"html-css-class-completion.HTMLLanguages": [
    ...
    "october-tpl"
],
```

For **CSS Peek** (pranaygp.vscode-css-peek) add `october-tpl` to `cssPeek.peekFromLanguages`

```json
"cssPeek.peekFromLanguages": [
    ...
    "october-tpl"
]
```

For **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) add this:

```json
"tailwindCSS.includeLanguages": {
    "october-tpl": "html"
},
```

## Notice

October CMS name and logo belongs to Aleksey Bobkov and Sam Georges.

The extension uses some open source libraries. List of used libraries and their licenses can be found in NOTICE.md
