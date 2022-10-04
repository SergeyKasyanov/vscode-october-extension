/* eslint-disable @typescript-eslint/naming-convention */

export const BEHAVIORS: { [behavior: string]: { property: string, command: string } } = {
    '\\Backend\\Behaviors\\ListController': {
        property: 'listConfig',
        command: 'command.add_behavior_config.ListController'
    },
    '\\Backend\\Behaviors\\FormController': {
        property: 'formConfig',
        command: 'command.add_behavior_config.FormController'
    },
    '\\Backend\\Behaviors\\ImportExportController': {
        property: 'importExportConfig',
        command: 'command.add_behavior_config.ImportExportController'
    },
    '\\Backend\\Behaviors\\RelationController': {
        property: 'relationConfig',
        command: 'command.add_behavior_config.RelationController'
    },
    '\\Backend\\Behaviors\\ReorderController': {
        property: 'reorderConfig',
        command: 'command.add_behavior_config.ReorderController'
    },
};
