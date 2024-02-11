# Change Log

## 0.26.0

Features:
- Lens with reference for yaml configs
- Completion of db connection names, log channels, queue names, storage disk names, mailers

Fixes:
- Some fixes to yaml schemas
- Fixed custom relation toolbar button template

## 0.25.0

Features:

- Find model usages in yaml configs
- Document links to custom buttons in `RelationController` config files
- Code action for creating custom buttons in `RelationController` config files

Improvements:

- Updated extension npm dependencies
- Updated yaml config schemas
- Now theme files formatting uses new prettier
- Auto completion performance improvements
- Settings model generator now uses `SettingModel` base class instead of `Model` with `SettingsModel` behavior for projects based on new versions of OctoberCMS

Fixes:

- Fixed indexing of database migrations placed in `app/database` directory
- Migrations placed in `app/database` don't showing `version.yaml` notice

## 0.24.0

Features:

- Detect OctoberCMS 3.5
- Completions of table names in `$belongsToMany` definitions
- Completions for itemType inside `registerNavigation()` method
- Check if behavior config exists and quick fix to create it

Fixes:

- Fixed model attributes completions
- Fixed link to `RelationController` config

## 0.23.1

Improvements:

- Guessing belongs to relations now includes attributes from model's docblock, $fillable and $guarded

## 0.23.0

Features:

- Guessing belongs to relations by attribute names ending with _id
- More accurate auto completions

Fixes:

- Fixed component property completions in theme files
- Fixed migration version lens for anonymous migrations

## 0.22.0

New features:

- Table names completions for migrations
- Ajax handlers completions in `data-request="..."` in controllers views
- Ajax handlers completions in `$this->getEventHandler('...')` in widgets views
- References and definitions for ajax handlers in controllers and widgets views

Improvements:

- Now migrations generator uses anonymous migrations for projects with October 3.3 or newer

Fixes:

- Fixed a bug that could hang entire VSCode autocompletion
- Fixed loading model relations
- Removed duplicates from controller action autocompletion

Also model generator uses `$fillable` instead of `$guarded`

## 0.21.0

New features:

- Options methods completions in list filters

Improvements:

- Extension now works with pivot models like with normal models
- Updated npm dependencies

Fixes:

- Options methods existance check in yaml configs
- Fixed yaml schemas for list filters
- Fixed document links to options and scopes methods in list filters
- Fixed check layout existence diagnostic

## 0.20.0

New features:

- Detect OctoberCMS v3.4
- New command for show OctoberCMS version
- New command for reindex workspace
- `content` twig filter for render page snippets introduced in octoberCMS v3.4
- Add `renderPageSnippets` option for plugin generator
- Completions of snippets properties in `viewBag` component in theme partials
- Completions of snippets properties in twig section of partials as variables

Improvements:

- Add `App` facade to phpstorm meta file generator
- Translation autocomplete show translations in details using current project locale

Fixes:

- Fixed showing env variables multiple times in `env()` completions
- Translation keys autocomplete now works in any file of project

## 0.19.0

New features:

- Definitions and references of events
- Definitions and references of env variables
- Document link for controller method in `$this->actionUrl('...')`

Improvements:

- Permision completions now works for `BackendAuth::userHasAccess` and `BackednAuth::userHasPermission`

## 0.18.0

New features:

- Completions of global event names

Improvements:

- Commands indexer now knows what is signature
- Use `$singnature` in artisan command generator for OctoberCMS >= 3.2
- Detect OctoberCMS version by `composer.lock` instead of `composer.json`. This makes version detection more accurate
- `icon:` completions now works in any `yaml`, not only Tailor blueprints

## 0.17.0

New features:

- Links to list config in `$this->listRender('list_name')` calls
- Links to relation config in `$this->relationRender('relation_name')` calls
- Links to command classes in `Artisan::call('command.code')`, `Artisan::queue('command.code')` calls *(for now only for modules and plugins commands)*
- Completions of command codes in `Artisan::call('command.code')`, `Artisan::queue('command.code')` calls *(for now only for modules and plugins commands)*
- Completions of partial names in `$this->makePartial('...')` inside widgets
- Ajax methods completions in `$this->getEventHandler('...')` calls inside widgets
- Document links to ajax methods in `$this->getEventHandler('...')` calls inside widgets

Improvements:

- Model attributes completions now triggers automatically in form and list configs

## 0.16.0

This release is everything about Tailor. Now OctoberCode knows what is Tailor blueprints and can help you with it.

New features of ths release:

- Completions of handles in navigation section of blueprints and in mixins
- Completions of icon names in navigation and primary navigation sections of blueprints
- Completions of handles in `handle` property when you use Tailor components in your themes files
- Finding references and definitions of Tailor blueprints in theme files and another blueprints
- Command `octoberCode.goToBlueprint` for quick open blueprint
- `octo` icon set in icon names completions

Fixes:

- Fixed project locale detector
- Fixed yaml schema for blueprints
- Fixed layout name completions

## 0.15.0

New features:

- Check if dropdown options method exists in model
- Actions for add accessor, mutator, getter and setter for model attributes

## 0.14.0

New features:

- Command for generating .phpstorm.meta.php file for extra autocompletions. *You need extension with support for phpstorm meta installed for this feature to work*
- Code lens for migrations with version in which this migration used

## 0.13.0

New features:

- Completions for recordUrl yaml property
- Document links for recordUrl yaml property

## 0.12.2

Fixes:

- Fix containerAttribute property in fields.yaml schema
- Fix guessing controller name for models

## 0.12.1

Improvements:

- Add ExpandoModel as base class for models

Fixes:

- Replace tabs with spaces in list_toolbar template
- Fix list filter yaml schema
- Add pagefinder property to blueprint schema

## 0.12.0

New features:

- New diagnostic for check view existance and quick fix for create it
- Completinos for `tab` names in `fields.yaml` based on alread defined tabs
- Command for quick open `version.yaml` of plugins

Fixes:

- model relation now loads all relations, not only for models from same plugin
- table names for `exists` and `unique` validation rules now in any php file, not only models

## 0.11.0

The main goal for this release was update version detection and yaml schemas to OctoberCMS v3.3.

Other changes includes:

New features:

- Completions for path helpers (`plugins_path()`, `themes_path()`, `storage_path()`, etc)
- Document links for arguments in path helpers
- Completions for view names in columns and fields partials
- Document links for view names in columns and fields partials
- Completions for table names in `exists` and `unique` validation rules
- New yaml schema for repeater groups files

Improvements:

- Extensions now correctly recognizes models extending `System\Models\SettingsModel`

## 0.10.3

New features:

- "Add timezones" option in model and migration generators
- Completions for `displayFrom` column option in `columns.yaml`

Improvements:

- Controller generator now not adding "New" button if there is no `FormController` behavior
- Added padding to `error` view when controller created with sidebar
- Attributes guessing now reads model accessors and mutators
- Completions for model attributes in `fields.yaml` and `columns.yaml` now inserts labels

Fixes:

- Links to partials placed not in controller directory now works correctly
- Add `morphTo`, `attachOne` and `attachMany` relations to guessing model relations names
- Cast types no completes correctly when cast on previous line is empty,
- Attributes in model properties now completes correctly

## 0.10.2

Fixes:

- Fixed template for controller with sidebar generator
- Fixed version detection for October 3.2 based projects

## 0.10.1

New features:

- Document links for options and scopes methods used in yaml configs
- Now you can generate controllers with sidebar
- Completions for behaviors names in `$this->asExtension()` and `$this->getClassExtension()` methods
- Completions for model attribute casts

Fixes:

- Completions for env variables now works in any php file inside project
- Document links for models now works in `app` directory
- Options methods completions in yaml configs now uses right model
- `list` and `filter` properties in yaml configs can be an empty array

## 0.10.0

New features:

- "Show usages" for theme files replaced with pick references view
- Document link for theme files replaced with go to definition

Fixes:

- Fixed namespaces in class generators when used with app directory
- Fixed completions of view file names in `View::make()`, `view()`, `Mail::send()` and `Mail::sendTo()` calls
- Fixed icon names and behavior config names completions
- "Go to model" and "go to migration" code lenses now works in app directory models and migrations

## 0.9.1

- Fixed completions model attributes in yaml configs
- Fixed diagnostic and link in yaml configs
- Improved completions of validation rules and messages in model
- Added `instance()` method inside docblock and `initSettingsData()` method in settings model generator

## 0.9.0

In this release code responsible for load project information was completely rewritten. This gives us significant improvements:

- Extension is not using php code for load data anymore
- Multi-folder workspaces are now supported
- Support for modules and app directory
- Support for parent/child themes

Other changes:

- Config keys `octoberCode.phpExecutable` and `octoberCode.enableThemeFilesFolding` was removed
- New config key: set `octoberCode.showModulesEntitiesInGoToCommands` to `true`, if you want to see models and controllers from modules in `octoberCode.goToModel` and `octoberCode.goToController` commands
- New completions: model attributes in `fields.yaml` and `columns.yaml` configs *(attributes must be filled in `$fillable`, `$guarded` or documented in model's docblock)*
- New completions: params for `Backend::url()`, `Backend::redirect()`, `Backend::redirectGuest()` and `Backend::redirectIntended()`
- New completions: language keys in `trans()`, `_()` and `__()`
- New document links: `Backend::url()`, `Backend::redirect()`, `Backend::redirectGuest()` and `Backend::redirectIntended()` to corresponding backend controller method
- New command: `octoberCode.goToLogFile` - open log file from /storage/logs directory
- Many fixes and improvements in existing yaml schemas, completions, generators and everything

## 0.7.5

- Fixed automatic adding spaces in twig tags
- Added new config `octoberCode.useSpacer` for toggle automatically adding spaces in twig tags

## 0.7.4

- Add `Multisite` trait in model and migration generators
- Check if model with `Multisite` trait has `$propagatable` property

## 0.7.3

- Added completions for `$this->listRender('...')`
- Added completions for `$this->relationRender('...')`

## 0.7.0

- First public release
