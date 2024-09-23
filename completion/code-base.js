const vscode = require("vscode");
const { StatementUtil } = require("../statement-util");
const { AblSource } = require("@oe-zext/source");

class CodeCompletionBase {
  documentController = AblSource.Controller.getInstance();

  provideCompletionItems(textDocument, position, token, context) {
    // ignores on include notation
    if (context.triggerCharacter == "{") return;

    let document = this.documentController.getDocument(textDocument);
    if (document) {
      let words = this.splitStatement(textDocument, position);
      if (!words || words.length == 0) words = [""];
      let completionItems = this.getCompletion(
        document,
        1,
        words,
        textDocument,
        position
      );
      completionItems = this.filterCompletionItems(
        completionItems,
        document,
        words,
        textDocument,
        position
      );
      return new vscode.CompletionList([...completionItems]);
    }
    return;
  }

  splitStatement(document, position) {
    return StatementUtil.dotSplitStatement(document, position);
  }

  get maxDeepLevel() {
    return 2;
  }

  getCompletion(document, deepLevel, words, textDocument, position) {
    let result = [
      ...this.getCompletionItems(document, words, textDocument, position),
    ];
    if (deepLevel < this.maxDeepLevel) {
      document?.includes.forEach((item) => {
        if (item.document) {
          let itemDocument = this.documentController.getDocument(item.document);
          if (itemDocument) {
            let itemResult = this.getCompletion(
              itemDocument,
              deepLevel + 1,
              words,
              item.document
            );
            if (itemResult?.length > 0) result.push(...itemResult);
          }
        }
      });
    }
    return result;
  }

  getCompletionItems(document, words, textDocument, position) {
    return [];
  }

  filterCompletionItems(items, document, words, textDocument, position) {
    return items;
  }
}

module.exports = CodeCompletionBase;
