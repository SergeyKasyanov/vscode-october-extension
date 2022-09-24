import { existsSync } from "fs";
import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { splitFrontendFile } from '../../../helpers/splitFrontendFile';
import { Project } from "../../../services/project";
import path = require("path");

export class PhpMailTemplateDocumentLinkProvider implements vscode.DocumentLinkProvider {

    private document: vscode.TextDocument | undefined;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.document = document;

        const { code, offset } = this.getPhpCode();

        if (!code) {
            return;
        }

        return [
            ...this.getMailSendLinks(code, offset || 0),
            ...this.getMailSendToLinks(code, offset || 0)
        ];
    }

    private getPhpCode(): { code?: string; offset?: number; } {
        let code;
        let offset;

        const isPhp = this.document!.fileName.endsWith('php');
        if (isPhp) {
            code = this.document!.getText();
            offset = 0;
        } else if (this.document!.fileName.endsWith('htm')) {
            const sections = splitFrontendFile(this.document!.getText());
            if (sections.length < 3) {
                return { code, offset };
            }

            code = sections[1];
            offset = sections[0].length + 4; // 4 is "<?php"
        } else {
            return { code, offset };
        }

        return { code, offset };
    }

    private getMailSendLinks(code: string, offset: number) {
        let links: vscode.DocumentLink[] = [];

        const mailSendCalls = code.matchAll(regExps.phpMailSendMethodFirstParamGlobal);
        for (const match of mailSendCalls) {
            const tplNameMatch = match[0].match(regExps.phpQuotedMailTemplateNameWord);

            if (tplNameMatch) {
                const tplName = tplNameMatch[0];
                const link = this.getLink(tplName, offset + match.index! + tplNameMatch.index! + 1);

                if (link) {
                    links.push(link);
                }
            }
        }

        return links;
    }

    private getMailSendToLinks(code: string, offset: number) {
        let links: vscode.DocumentLink[] = [];

        const mailSendCalls = code.matchAll(regExps.phpMailSendToMethodSecondParamGlobal);
        for (const match of mailSendCalls) {
            const tplNameMatch = match[0].match(regExps.phpQuotedMailTemplateNameWord);

            if (tplNameMatch) {
                const tplName = tplNameMatch[0];
                const link = this.getLink(tplName, offset + match.index! + tplNameMatch.index! + 1);

                if (link) {
                    links.push(link);
                }
            }
        }

        return links;
    }

    private getLink(tplName: string, offset: number) {
        const nameParts = tplName.slice(1, -1).split('::');
        const pluginCode = nameParts[0];
        const tplFileName = nameParts[1].split('.').join(path.sep) + '.htm';

        const plugin = Project.instance.getPlugin(pluginCode);
        if (!plugin) {
            return;
        }

        const tplPath = plugin.filePath(path.join('views', tplFileName));

        if (!existsSync(tplPath)) {
            return;
        }

        const range = new vscode.Range(
            this.document!.positionAt(offset),
            this.document!.positionAt(offset + tplName.length - 2)
        );

        return new vscode.DocumentLink(
            range,
            vscode.Uri.file(tplPath)
        );
    }
}
