import * as vscode from "vscode"

export class File {
  provideCompletionItems(document, position, token, context) {
    // only triggers on include notation
    if (context.triggerCharacter != "{") return []
    return this.getFileList(token)
  }

  getFileList(token) {
    return vscode.workspace
      .findFiles("**/*.i", null, null, token)
      .then(values =>
        values.map(item => {
          return new vscode.CompletionItem(
            vscode.workspace.asRelativePath(item.path),
            vscode.CompletionItemKind.Reference
          )
        })
      )
  }
}
