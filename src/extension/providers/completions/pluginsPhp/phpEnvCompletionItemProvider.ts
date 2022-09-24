import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpEnvCompletionItemProvider implements CompletionItemProvider {
    provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {

        if (!isRightAfter(document, position, regExps.phpEnvFunctionGlobal, regExps.empty)) {
            return;
        }

        return Project.instance.getEnvKeys().map(k => new CompletionItem(
            k,
            CompletionItemKind.EnumMember
        ));
    }
}
