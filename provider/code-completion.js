const vscode = require("vscode");
const CompletionProvider = require("../completion");
const AblSchema = require("@oe-zext/types");

class CodeCompletion {
  static attach(context) {
    let instance = new CodeCompletion();
    instance.registerProviders(context);
  }

  registerProviders(context) {
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Buffer(),
        "."
      )
    );
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Method(),
        "."
      )
    );
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.TempTable(),
        "."
      )
    );
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Variable(),
        "."
      )
    );

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.Table(),
        "."
      )
    );

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        AblSchema.languageId,
        new CompletionProvider.File(),
        "{"
      )
    );
  }
}
module.exports = CodeCompletion;