import * as path from 'path';
import { Config } from '../../config';
import { Controller } from '../entities/classes/controller';
import { Widget } from '../entities/classes/widget';
import { FsHelpers } from './fs-helpers';

/**
 * Helpers for generate workspace related files paths
 */
export class PathHelpers {
    /**
     * Generate path related to workspace root
     *
     * @param projectPath
     * @param location
     * @returns
     */
    static rootPath(projectPath: string, location: string = ''): string {
        return path.join(projectPath, location);
    }

    /**
     * Generate path related to app directory of workspace
     *
     * @param projectPath
     * @param location
     * @returns
     */
    static appPath(projectPath: string, location: string = ''): string {
        return path.join(projectPath, 'app', location);
    }

    /**
     * Generate path related to plugins directory of workspace
     *
     * @param projectPath
     * @param location
     * @returns
     */
    static pluginsPath(projectPath: string, location: string = ''): string {
        return path.join(projectPath, Config.pluginsDirectory, location);
    }

    /**
     * Generate path related to themes directory of workspace
     *
     * @param projectPath
     * @param location
     * @returns
     */
    static themesPath(projectPath: string, location: string = ''): string {
        return path.join(projectPath, Config.themesDirectory, location);
    }

    /**
     * Generate path related to modules directory of workspace
     *
     * @param projectPath
     * @param location
     * @returns
     */
    static modulesPath(projectPath: string, location: string = ''): string {
        return path.join(projectPath, 'modules', location);
    }

    /**
     * Generate path to file from relative path :
     * - $/me/blog/controllers/posts/partials/_title.htm
     * - ~/plugins/me/blog/controllers/posts/partials/_title.htm
     * - partials/title
     *
     * @param projectPath
     * @param relativePath
     * @param controller
     * @returns
     */
    static relativePath(
        projectPath: string,
        relativePath: string,
        controller: Controller | Widget | undefined | null = undefined
    ): string | undefined {
        let filePath: string | undefined;

        if (relativePath.startsWith('~')) {
            filePath = relativePath.slice(1);
            if (filePath.startsWith('/')) {
                filePath = filePath.slice(1);
            }

            filePath = PathHelpers.rootPath(projectPath, filePath);
        } else if (relativePath.startsWith('$')) {
            filePath = relativePath.slice(1);
            if (filePath.startsWith('/')) {
                filePath = filePath.slice(1);
            }

            filePath = PathHelpers.pluginsPath(projectPath, filePath);
        } else if (controller) {
            let nameParts = relativePath.split('/');

            if (controller instanceof Widget) {
                nameParts = ['partials', ...nameParts];
            }

            const fileName = nameParts.pop();

            // controller/widgets partials does not have extension
            // e.g. $this->makePartial('partials/hello_world')
            let isLocalPartial = true;
            const knownExtensions = ['yaml', 'php', 'htm'];
            for (const ext of knownExtensions) {
                if (fileName!.endsWith(ext)) {
                    isLocalPartial = false;
                    break;
                }
            }

            if (isLocalPartial) {
                const project = controller.owner.project;
                for (const ext of project!.platform!.backendViewExtensions) {
                    const candidate = path.join(controller.filesDirectory, ...nameParts, '_' + fileName + '.' + ext);
                    if (FsHelpers.exists(candidate)) {
                        filePath = candidate;
                        break;
                    }
                }

                if (!filePath) {
                    filePath = path.join(controller.filesDirectory, ...nameParts, '_' + fileName + '.' + project!.platform!.mainBackendViewExtension);
                }
            } else {
                filePath = path.join(controller.filesDirectory, ...nameParts, fileName!);
            }
        }

        return filePath;
    }

    /**
     * Generate relative path variants
     * - $/me/blog/controllers/posts/partials/_title.htm
     * - ~/plugins/me/blog/controllers/posts/partials/_title.htm
     * - partials/title
     *
     * from full path
     */
    static pathVariants(projectPath: string, filePath: string): string[] {
        const results: string[] = [];

        filePath = filePath.replace(projectPath, '');
        filePath = filePath.split(path.sep).join('/');

        results.push('~' + filePath);

        if (filePath.startsWith('/' + Config.pluginsDirectory)) {
            results.push('$' + filePath.replace('/' + Config.pluginsDirectory, ''));
        }

        return results;
    }
}
