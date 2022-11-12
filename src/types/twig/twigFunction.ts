import { MarkdownString } from "vscode";
import { Version } from "../../domain/enums/october-version";

export interface TwigFunction {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
    plugin?: string
    minVersion?: Version,
}
