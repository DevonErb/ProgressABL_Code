import * as vscode from "vscode"
import { AblSource } from "@oe-zext/source"
import { AblSchema } from "@oe-zext/types"

export class Symbol {
  static attach(context) {
    let instance = new Symbol()
    instance.registerCommands(context)
  }

  registerCommands(context) {
    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
        AblSchema.languageId,
        this
      )
    )
  }

  provideDocumentSymbols(document, token) {
    let doc = AblSource.Controller.getInstance().getDocument(document)
    if (doc) {
      return new Promise(resolve => {
        let documentSymbols = this.documentSymbols.bind(this)
        if (!token.isCancellationRequested) resolve(documentSymbols(doc))
        resolve(null)
      })
    }
    return
  }

  documentSymbols(document) {
    let symbols = []
    // methods / params / local variables
    document.methods.forEach(method => {
      symbols.push(
        new vscode.SymbolInformation(
          method.name,
          vscode.SymbolKind.Method,
          "Methods",
          new vscode.Location(document.document.uri, method.range)
        )
      )
      // parameters
      method.params?.forEach(param => {
        symbols.push(
          new vscode.SymbolInformation(
            param.name,
            vscode.SymbolKind.Property,
            method.name,
            new vscode.Location(document.document.uri, param.position)
          )
        )
      })
      // local variables
      method.localVariables?.forEach(variable => {
        symbols.push(
          new vscode.SymbolInformation(
            variable.name,
            vscode.SymbolKind.Variable,
            method.name,
            new vscode.Location(document.document.uri, variable.position)
          )
        )
      })
    })
    return symbols
  }
}
