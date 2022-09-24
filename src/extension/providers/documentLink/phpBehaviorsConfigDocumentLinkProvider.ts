import * as fs from "fs";
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { getClassPropertiesFromDocument, parsePhp, PropertiesList } from "../../../helpers/parsePhp";
import { relativePath } from "../../../helpers/paths";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import path = require("path");

const BEHAVIOR_CONFIG_PROPERTIES = [
    'listConfig',
    'formConfig',
    'relationConfig',
    'importExportConfig',
    'reorderConfig',
    'popupConfig',
];

export class PhpBehaviorsConfigDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private document: vscode.TextDocument | undefined;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || !parsed.directory || !['models', 'controllers'].includes(parsed.directory)) {
            return;
        }

        this.document = document;

        return this.getLinks();
    }

    private getLinks(): vscode.DocumentLink[] {
        try {
            let links: vscode.DocumentLink[] = [];

            const properties = getClassPropertiesFromDocument(this.document!.getText(), this.document!.fileName);

            for (const p in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, p)) {
                    const prop = properties[p];

                    const propName = prop.name as phpParser.Identifier | string;
                    const name = propName instanceof Object ? propName.name : propName;
                    if (!BEHAVIOR_CONFIG_PROPERTIES.includes(name) || !prop.value?.loc) {
                        continue;
                    }

                    if (prop.value.kind === 'string') {
                        const propVal = (prop.value as phpParser.String).value;
                        const filePath = relativePath(propVal, this.document!.fileName);
                        if (!(filePath && fs.existsSync(filePath) && fs.lstatSync(filePath).isFile())) {
                            continue;
                        }

                        links.push(this.createLink(filePath, prop.value.loc));
                    } else if (prop.value.kind === 'array') {
                        (prop.value as phpParser.Array).items.forEach(entry => {
                            const entryValue = ((entry as phpParser.Entry).value as unknown as phpParser.String);

                            const filePath = relativePath(entryValue.value, this.document!.fileName);
                            if (!(filePath && fs.existsSync(filePath) && fs.lstatSync(filePath).isFile())) {
                                return;
                            }

                            links.push(this.createLink(filePath, entryValue.loc!));
                        });
                    }
                }
            }

            return links;
        } catch {
            return [];
        }
    }

    private createLink(filePath: string, loc: phpParser.Location): vscode.DocumentLink {
        return new vscode.DocumentLink(
            new vscode.Range(
                new vscode.Position(loc.start.line - 1, loc.start.column + 1),
                new vscode.Position(loc.end.line - 1, loc.end.column - 1)
            ),
            vscode.Uri.file(filePath)
        );
    }
}
