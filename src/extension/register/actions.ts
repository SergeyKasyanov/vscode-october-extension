import * as vscode from "vscode";
import { registerExtractPartialAction } from "../providers/actions/extract-partial";

export function registerCodeActions(context: vscode.ExtensionContext): void {
    registerExtractPartialAction(context);
}
