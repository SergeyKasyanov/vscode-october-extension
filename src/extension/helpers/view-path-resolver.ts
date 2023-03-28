import path = require("path");
import { Project } from "../../domain/entities/project";
import { FsHelpers } from "../../domain/helpers/fs-helpers";

/**
 * Converts view code like "acme.blog::notify.new_post"
 * to path like "plugins/acme/blog/views/notify/new_post.htm"
 *
 * @param project
 * @param view
 */
export function resolveViewPath(project: Project, view: string): string | undefined {
    const projectViews = project.views;
    if (!projectViews.includes(view)) {
        return;
    }

    const [ownerCode, viewCode] = view.split('::');

    const owner = project.findOwnerByName(ownerCode);
    if (!owner) {
        return;
    }

    let viewPath: string | undefined;

    for (const ext of ['php', 'htm']) {
        const candidate = path.join(owner.path, 'views', ...viewCode.split('.')) + '.' + ext;
        if (FsHelpers.exists(candidate)) {
            viewPath = candidate;
        }
    }

    return viewPath;
}
