const vscode = require("vscode");
const { StatementUtil } = require("../statement-util");
const { AblDatabase } = require("@oe-zext/database");

class Table {
  constructor() {
    AblDatabase.Controller.getInstance().onChange((db) =>
      this.resetTableCompletion()
    );
  }

  provideCompletionItems(document, position, token, context) {
    // ignores on include notation
    if (context.triggerCharacter == "{") return;

    let words = StatementUtil.dotSplitStatement(document, position);
    if (words.length == 2) {
      let table = AblDatabase.Controller.getInstance().getTable(words[0]);
      if (table) {
        return [
          ...Table.fieldsCompletion(table),
          ...Table.tableSnippets(table),
        ];
      }
    } else if (words.length == 1) {
      return new vscode.CompletionList([...this.getStatementCompletion()]);
    }
    return;
  }

  getStatementCompletion() {
    if (!this.tableCompletion) this.setTableCompletion();
    return this.tableCompletion;
  }

  setTableCompletion() {
    this.tableCompletion = AblDatabase.Controller.getInstance()
      .getCollection()
      .map((table) => {
        let pkFields = table.indexes.find((i) => i.isPK)?.fields.join(", ");
        let r = new vscode.CompletionItem(
          table.name,
          vscode.CompletionItemKind.File
        );
        r.detail = table.description;
        let doc = new vscode.MarkdownString();
        doc.appendMarkdown(`- table *${table.name}*\n`);
        if (pkFields) doc.appendMarkdown(`- key: *${pkFields}*\n`);
        r.documentation = doc;
        return r;
      });
  }

  resetTableCompletion() {
    this.tableCompletion = null;
  }

  static fieldsCompletion(table, nameReplacement) {
    return table.fields.map((field) => {
      let item = new vscode.CompletionItem(
        field.name,
        vscode.CompletionItemKind.Field
      );
      item.detail = Table.fieldDetail(field);
      item.documentation = Table.fieldDocumentation(field);
      return item;
    });
  }

  static fieldDetail(field) {
    return `field ${field.name}`;
  }

  static fieldDocumentation(field) {
    let result = new vscode.MarkdownString();
    if (field.isPK) result.appendMarkdown(`- **Primary Key**\n`);
    else if (field.isKey) result.appendMarkdown(`- **Used in index**\n`);
    if (field.mandatory) result.appendMarkdown(`- **Mandatory**\n`);
    result.appendMarkdown(`- Label: *'${field.description}'*\n`);
    result.appendMarkdown(`- Type: *${field.type}*\n`);
    result.appendMarkdown(`- Format *${field.format}*\n`);
    return result;
  }

  static tableSnippets(table, nameReplacement) {
    let result = [];

    // All fields completion snippet
    let snippet = new vscode.SnippetString();
    let isFirst = true;
    let maxSize = 0;
    table.fields.forEach((field) => {
      if (field.name.length > maxSize) maxSize = field.name.length;
    });
    table.fields.forEach((field) => {
      if (isFirst) {
        isFirst = false;
      } else {
        snippet.appendText("\n");
        snippet.appendText((nameReplacement || table.name) + ".");
      }
      snippet.appendText(field.name.padEnd(maxSize, " ") + " = ");
      snippet.appendTabstop();
    });
    let allFieldsItem = new vscode.CompletionItem(
      ">ALL FIELDS",
      vscode.CompletionItemKind.Snippet
    );
    allFieldsItem.detail = "insert all table fields";
    allFieldsItem.insertText = snippet;
    result.push(allFieldsItem);
    // indexes
    table.indexes.forEach((index) => {
      if (!index.fields) return;
      let item = new vscode.CompletionItem(
        index.name,
        vscode.CompletionItemKind.Snippet
      );
      let snippet = new vscode.SnippetString();
      let isFirst = true;
      maxSize = 0;
      index.fields.forEach((fieldName) => {
        if (fieldName.length > maxSize) maxSize = fieldName.length;
      });
      index.fields.forEach((fieldName) => {
        if (isFirst) {
          isFirst = false;
        } else {
          snippet.appendText("\n");
          snippet.appendText((nameReplacement || table.name) + ".");
        }
        snippet.appendText(fieldName.padEnd(maxSize, " ") + " = ");
        snippet.appendTabstop();
      });
      item.insertText = snippet;
      item.detail = index.fields.join(", ");
      if (index.isPK) {
        item.label = ">INDEX (PK) " + item.label;
        item.detail = "Primary Key, Fields: " + item.detail;
      } else if (index.isUnique) {
        item.label = ">INDEX (U) " + item.label;
        item.detail = "Unique Index, Fields: " + item.detail;
      } else {
        item.label = ">INDEX " + item.label;
        item.detail = "Index, Fields: " + item.detail;
      }
      result.push(item);
    });
    //

    return result;
  }
}
module.exports = Table;