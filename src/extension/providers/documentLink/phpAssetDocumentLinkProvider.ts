import { existsSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import { getClassFromDocument, getUsesFromDocument } from "../../../helpers/parsePhp";
import { pluginsPath, rootPath } from "../../../helpers/paths";
import { ParsedPluginFileName, PluginFileUtils } from "../../../helpers/pluginFileUtils";

export class PhpAssetDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private document?: vscode.TextDocument;
    private parsedFilename?: ParsedPluginFileName;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
        this.document = document;

        this.parsedFilename = PluginFileUtils.parseFileName(document.fileName);
        if (!this.parsedFilename) {
            return;
        }

        const phpClass = getClassFromDocument(document.getText(), document.fileName);
        if (!phpClass?.extends) {
            return;
        }

        const resolution = (phpClass.extends as any).resolution;

        let extendsClass;
        if (resolution === 'uqn') {
            const uses = getUsesFromDocument(document.getText(), document.fileName);
            extendsClass = uses[phpClass.extends.name];
        } else if (resolution === 'fqn') {
            extendsClass = phpClass.extends!.name;
        }

        if (!extendsClass) {
            return;
        }

        if (extendsClass === 'Backend\\Classes\\Controller') {
            return this.getAssetLinks();
        }

        const widgetsParents = [
            'Backend\\Classes\\WidgetBase',
            'Backend\\Classes\\ReportWidgetBase',
            'Backend\\Classes\\FormWidgetBase',
        ];

        if (widgetsParents.includes(extendsClass)) {
            return this.getAssetLinks(true);
        }

        return;
    }

    private getAssetLinks(widgets: boolean = false): vscode.ProviderResult<vscode.DocumentLink[]> {
        let links = [];

        const linksMatches = this.document!.getText().matchAll(/(addCss|addJs)\(.*?\)/g);
        for (const match of linksMatches) {
            const matchText = match[0].startsWith('addCss')
                ? match[0].slice(7, -1).trim().slice(1, -1)
                : match[0].slice(6, -1).trim().slice(1, -1);

            if (matchText.startsWith('http')) {
                const startCharDelta = match[0].indexOf(matchText);
                const range = new vscode.Range(
                    this.document!.positionAt(match.index!).translate(0, startCharDelta),
                    this.document!.positionAt(match.index!).translate(0, startCharDelta + matchText.length),
                );

                links.push(new vscode.DocumentLink(
                    range,
                    vscode.Uri.parse(matchText, true)
                ));
            }

            if (matchText.startsWith('/')) {
                const assetUri = rootPath(matchText);
                if (existsSync(assetUri)) {
                    const startCharDelta = match[0].indexOf(matchText);
                    const range = new vscode.Range(
                        this.document!.positionAt(match.index!).translate(0, startCharDelta),
                        this.document!.positionAt(match.index!).translate(0, startCharDelta + matchText.length),
                    );

                    links.push(new vscode.DocumentLink(
                        range,
                        vscode.Uri.file(assetUri)
                    ));
                }
            } else if (widgets) {
                const assetUri = pluginsPath(path.join(
                    this.parsedFilename!.vendor!,
                    this.parsedFilename!.plugin!,
                    this.parsedFilename!.directory!,
                    this.parsedFilename!.classNameWithoutExt!.toLocaleLowerCase(),
                    'assets',
                    matchText
                ));

                if (existsSync(assetUri)) {
                    const startCharDelta = match[0].indexOf(matchText);
                    const range = new vscode.Range(
                        this.document!.positionAt(match.index!).translate(0, startCharDelta),
                        this.document!.positionAt(match.index!).translate(0, startCharDelta + matchText.length),
                    );

                    links.push(new vscode.DocumentLink(
                        range,
                        vscode.Uri.file(assetUri)
                    ));
                }
            }
        }

        return links;
    }
}
