# Change Log

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
