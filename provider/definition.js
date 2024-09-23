const vscode = require("vscode");
const { StatementUtil } = require("../statement-util");
const { AblType, AblTypeCheck, AblSchema } = require("@oe-zext/types");
const { AblSource } = require("@oe-zext/source");

class Definition {
  static attach(context) {
    let instance = new Definition();
    instance.registerCommands(context);
  }

  constructor() {
    this.documentController = AblSource.Controller.getInstance();
  }

  registerCommands(context) {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(AblSchema.languageId, this)
    );
  }

  provideDefinition(document, position, token) {
    // go-to definition
    let statement = StatementUtil.statementAtPosition(document, position);
    let doc = this.documentController.getDocument(document);
    if (doc) {
      return this.a(doc, position);
    }
    return;
  }

  a(document, position) {
    let statement = StatementUtil.statementAtPosition(
      document.document,
      position
    );
    if (!statement) return;

    let words = StatementUtil.cleanArray(
      statement.statement.split(/[\.\:\s\t]/)
    );
    if (words.length > 0) {
      let reference = document.searchReference(statement.word, position);
      if (reference) {
        if (
          AblTypeCheck.isVariable(reference) &&
          reference.dataType == AblType.ATTRIBUTE_TYPE.TEMP_TABLE
        ) {
          reference = document.getTempTable(reference.name);
          if (AblTypeCheck.isTempTable(reference)) {
            return Promise.resolve(
              new vscode.Location(reference.uri, reference.range)
            );
          }
        } else if (
          AblTypeCheck.isParameter(reference) &&
          reference.dataType == AblType.ATTRIBUTE_TYPE.TEMP_TABLE
        ) {
          reference = document.getTempTable(reference.name);
          if (AblTypeCheck.isTempTable(reference)) {
            return Promise.resolve(
              new vscode.Location(reference.uri, reference.range)
            );
          }
        }
        if (AblTypeCheck.hasPosition(reference)) {
          return Promise.resolve(
            new vscode.Location(reference.uri, reference.position)
          );
        } else if (AblTypeCheck.hasRange(reference)) {
          return Promise.resolve(
            new vscode.Location(reference.uri, reference.range)
          );
        }
      } else {
        let result;
        let incName = statement.statement
          .trim()
          .toLowerCase()
          .replace("\\", "/");
        document.includes
          .filter((include) => !!include.document)
          .find((include) => {
            if (include.name == incName) {
              result = include.document;
              return true;
            }
            return false;
          });
        if (result)
          return Promise.resolve(
            new vscode.Location(result.uri, new vscode.Position(0, 0))
          );
      }
    }
    return;
  }
}
module.exports = Definition;
