import { MarkdownString } from "vscode";
import { Version } from "../octoberVersion";

export interface TwigTag {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
    minVersion?: Version,
}
