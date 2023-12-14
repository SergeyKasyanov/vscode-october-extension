import * as vscode from "vscode";
import { registerAddAttributeMethods } from "../providers/actions/add-attribute-methods";
import { registerCreateCustomRelationToolbarButton } from "../providers/actions/create-custom-relation-toolbar-button";
import { registerExtractPartialAction } from "../providers/actions/extract-partial";

export function registerCodeActions(context: vscode.ExtensionContext): void {
    registerExtractPartialAction(context);
    registerAddAttributeMethods(context);
    registerCreateCustomRelationToolbarButton(context);
}
