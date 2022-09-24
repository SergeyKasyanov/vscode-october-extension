import * as vscode from "vscode";
import { camelCase } from "../../../helpers/str";
import { Themes } from "../../../services/themes";
import { Layout } from "../../../types/theme/layout";
import { Page } from "../../../types/theme/page";
import { Partial } from "../../../types/theme/partial";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";
import { HoverFactory } from "../../factories/hoverFactory";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";
import * as iniProperties from "../../staticData/iniProperties";

export class IniPropertyHoverProvider implements vscode.HoverProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    private property: string = '';

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        this.document = document;
        this.position = position;

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        if (!LineSectionChecks.insideFileConfigSection(this.document!, this.position!)) {
            return;
        }

        this.detectProperty();

        if (!this.property || this.property === '' || this.property === '=') {
            return;
        }

        let propData: iniProperties.IniProperty;

        if (thisFile instanceof Layout) {
            propData = iniProperties.layout[this.property];
        } else if (thisFile instanceof Page) {
            propData = iniProperties.page[this.property];
        } else if (thisFile instanceof Partial) {
            propData = iniProperties.partial[this.property];
        } else {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromIniProperty(propData));
        });
    }

    private detectProperty() {
        const wordRange = this.document!.getWordRangeAtPosition(this.position!);
        if (!wordRange) {
            return;
        }

        this.property = this.document!.lineAt(this.position!).text.slice(wordRange.start.character, wordRange.end.character);
        if (this.property) {
            this.property = camelCase(this.property);
        }
    }
}
