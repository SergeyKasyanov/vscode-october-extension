import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const BACKEND_URL_CALL = /Backend\s*::\s*(url|redirect|redirectGuest|redirectIntended)\s*\(\s*[\'\"]/g;
const URL_PART = /^[\w\-\_\/]*$/;
const URL = /[\w\-\_\/]+/;

/**
 * Completions for Backend::url(...)
 */
export class BackendUrl implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName);

        const project = entity?.owner.project || Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const offset = document.offsetAt(position);

        const isPhp = document.fileName.endsWith('.php')
            || (entity instanceof MarkupFile && entity.isOffsetInsidePhp(offset));

        if (!isPhp) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            offset,
            BACKEND_URL_CALL,
            URL_PART
        )) {
            return;
        }

        const urls: string[] = [];

        project.controllers.forEach(controller => {
            let url = controller.owner.name.replace('.', '/');
            if (controller.uqn !== 'Index') {
                url += '/' + controller.uqn.toLowerCase();
            }

            Object.keys(controller.pageMethods).forEach(pageMethod => {
                if (pageMethod !== 'index') {
                    urls.push(url + '/' + pageMethod);
                } else {
                    urls.push(url);
                }
            });

            const controllerBehaviors = Object.values(controller.behaviors).map(b => b.behavior);

            for (const beh of controllerBehaviors) {
                beh.pageMethods.forEach(pageMethod => {
                    urls.push(url + '/' + pageMethod);
                });
            }
        });

        return urls.map(url => {
            const item = new vscode.CompletionItem(url);
            item.range = document.getWordRangeAtPosition(position, URL);

            return item;
        });
    }
}
