import * as vscode from 'vscode';
import { FsHelpers } from "../../domain/helpers/fs-helpers";
import { PathHelpers } from '../../domain/helpers/path-helpers';
import { Str } from "../../helpers/str";
import { chooseProject } from "./concerns/choose-project";
import path = require('path');


/**
 * Generates .phpstorm.meta.php file
 */
export async function generatePhpStormMeta() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const filePath = PathHelpers.rootPath(project.path, path.join('.vscode', '.phpstorm.meta.php'));

    if (FsHelpers.exists(filePath)) {
        vscode.window.showErrorMessage(`File ${filePath} already exists`);
        return;
    }

    const template = require('./templates/phpstorm.meta.php.twig');

    const behaviors = [
        ...project.controllerBehaviors,
        ...project.modelBehaviors
    ].flatMap(beh => [
        `\\${beh.fqn}::class => \\${beh.fqn}::class`,
        `'${Str.replaceAll(beh.fqn, '\\', '.')}' => \\${beh.fqn}::class`,
        `'${beh.uqn}' =>  \\${beh.fqn}::class`,
    ]);

    const content = template({ behaviors });

    FsHelpers.writeFile(filePath, content);
}
