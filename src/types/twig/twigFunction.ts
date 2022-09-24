import { MarkdownString } from "vscode";
import { Version } from "../octoberVersion";

export interface TwigFunction {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
    plugin?: string
    minVersion?: Version,
}
