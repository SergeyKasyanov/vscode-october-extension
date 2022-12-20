import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Controller } from "../../../domain/entities/classes/controller";
import { Model } from "../../../domain/entities/classes/model";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import path = require("path");

/**
 * Document links for controller behaviors configs
 *
 * public $listConfig = 'config_list.yaml';
 */
export class BehaviorConfig implements vscode.DocumentLinkProvider {

    private entity?: Controller | Model;

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.entity = Store.instance.findEntity(document.fileName) as Controller | Model;
        if (!(this.entity instanceof Controller || this.entity instanceof Model)) {
            return;
        }

        const behaviors = Object.values(this.entity.behaviors).map(b => b.behavior);
        if (behaviors.length === 0) {
            return;
        }

        const properties = this.entity.phpClassProperties;
        if (!properties) {
            return;
        }

        const links: vscode.DocumentLink[] = [];

        behaviors
            .flatMap(beh => beh.requiredProperties)
            .forEach(reqProp => {
                const property = properties[reqProp];

                if (property?.value?.kind === 'string') {
                    const link = this.makeLink(property);
                    if (link) {
                        links.push(link);
                    }
                } else if (property?.value?.kind === 'array') {
                    (property.value as phpParser.Array).items.forEach(_item => {
                        const item = _item as phpParser.Entry;

                        if (item.key?.kind === 'string' && item.value.kind === 'string') {
                            const link = this.makeLink(item);
                            if (link) {
                                links.push(link);
                            }
                        }
                    });
                }
            });

        return links;
    }

    /**
     * Make link from property value or array entry
     *
     * @param item
     * @returns
     */
    private makeLink(item: phpParser.Property | phpParser.Entry) {
        const value = (item.value as phpParser.String).value;
        if (value.length === 0) {
            return;
        }

        const configPath = this.configPath(value);

        if (!FsHelpers.exists(configPath)) {
            return;
        }

        const loc = item.value!.loc!;

        const range = new vscode.Range(
            new vscode.Position(loc.start.line - 1, loc.start.column + 1),
            new vscode.Position(loc.end.line - 1, loc.end.column - 1)
        );

        const url = vscode.Uri.file(configPath);

        return new vscode.DocumentLink(range, url);
    }

    /**
     * Build config path
     *
     * @param propertyValue
     * @returns
     */
    private configPath(propertyValue: string) {
        if (propertyValue.startsWith('~')) {
            let configPath = propertyValue.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            return PathHelpers.rootPath(this.entity!.owner.project.path, configPath);
        } else if (propertyValue.startsWith('$')) {
            let configPath = propertyValue.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            return PathHelpers.pluginsPath(this.entity!.owner.project.path, configPath);
        } else {
            return path.join(this.entity!.filesDirectory, propertyValue);
        }
    }
}
