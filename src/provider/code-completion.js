import * as vscode from "vscode"
import { CompletionProvider } from "../completion"
import { AblSchema } from "@openEdge/types"

export class CodeCompletion {
  static attach(context) {
    let instance = new CodeCompletion()
    instance.registerProviders(context)
  }

  registerProviders(context) {
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Buffer(),
        "."
      )
    )
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Method(),
        "."
      )
    )
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.TempTable(),
        "."
      )
    )
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Variable(),
        "."
      )
    )

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Table(),
        "."
      )
    )

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.File(),
        "{"
      )
    )
  }
}
