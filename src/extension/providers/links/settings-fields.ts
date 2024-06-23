import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import { Model } from '../../../domain/entities/classes/model';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { PhpHelpers } from '../../../domain/helpers/php-helpers';
import { Store } from '../../../domain/services/store';
import path = require('path');

/**
 * Document link for SettingsModel $settingsField property
 *
 * public $settingsFields = 'fields.yaml';
 */
export class SettingsFields implements vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<DocumentLink[]> {
        const entity = Store.instance.findEntity(document.fileName);
        if (!(entity instanceof Model)) {
            return;
        }

        const phpClass = entity.phpClass;
        if (!phpClass) {
            return;
        }

        const extendsName = phpClass.extends?.name;
        if (!extendsName) {
            return;
        }

        const usesList = PhpHelpers.getUsesList(entity.fileContent!, entity.filename);
        const isSettingsModel = PhpHelpers.identifierToString(extendsName) === 'System\\Models\\SettingModel'
            || usesList[extendsName] === 'System\\Models\\SettingModel';

        if (!isSettingsModel) {
            return;
        }

        const phpProperties = PhpHelpers.getProperties(phpClass);

        const value = phpProperties.settingsFields?.value;
        if (!value) {
            return;
        }

        if (value.kind !== 'string') {
            return;
        }

        const valueValue = (value as phpParser.String).value;
        if (valueValue.length === 0) {
            return;
        }

        const configPath = path.join(entity.filesDirectory, valueValue);
        const range = PhpHelpers.locationToRange(value.loc!);
        const correctRange = new vscode.Range(
            range.start.translate(0, 1),
            range.end.translate(0, -1)
        );


        return [new DocumentLink(configPath, correctRange, vscode.Uri.file(configPath))];
    }
}

class DocumentLink extends vscode.DocumentLink {
    constructor(
        public configPath: string,
        range: vscode.Range,
        target?: vscode.Uri
    ) {
        super(range, target);
    }
}
