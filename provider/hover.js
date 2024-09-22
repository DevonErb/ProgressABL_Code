//check this one

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hover = void 0;

//var vscode = require("vscode");
const vscode = require("vscode");
//var statement_util_1 = require("../statement-util");
const { statement_util_1 } = require('../statement-util');
//var types_1 = require("@oe-zext/types");
const { types_1 } = require('@oe-zext/types');
//var database_1 = require("@oe-zext/database");
const { database_1 } = require('@oe-zext/database');
//var source_1 = require("@oe-zext/source");
const { source_1 } = require('@oe-zext/source');

var Hover = /** @class */ (function () {
  function Hover() {
    this.documentController = source_1.AblSource.Controller.getInstance();
    this.dbfController = database_1.AblDatabase.Controller.getInstance();
  }
  Hover.attach = function (context) {
    var instance = new Hover();
    instance.registerCommands(context);
  };
  Hover.prototype.registerCommands = function (context) {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(types_1.AblSchema.languageId, this)
    );
  };
  Hover.prototype.provideHover = function (document, position, token) {
    var doc = this.documentController.getDocument(document);
    if (doc) return this.analyseHover(doc, position, token);
    return;
  };
  Hover.prototype.analyseHover = function (document, position, token) {
    var statement = statement_util_1.StatementUtil.statementAtPosition(
      document.document,
      position
    );
    if (!statement) return;
    var words = statement_util_1.StatementUtil.cleanArray(
      statement.statement.split(/[\.\:\s\t]/)
    );
    if (words.length > 0) {
      if (
        words.length == 1 ||
        (words.length == 2 && statement.word == words[0])
      ) {
        // document variables/params/temp-tables
        var reference = document.searchReference(words[0], position);
        if (reference) {
          return this.buildHoverFromReference(document, reference, statement);
        }
        // check for table names
        var table = this.dbfController.getTable(words[0]);
        if (table) {
          return this.buildHoverFromTable(table, statement);
        }
      } else if (words.length == 2) {
        // document variables/params/temp-tables
        var reference = document.searchReference(words[0], position);
        if (reference) {
          return this.buildHoverFromReferenceProperty(
            document,
            reference,
            words[1],
            statement
          );
        }
        // check for table
        var table = this.dbfController.getTable(words[0]);
        if (table) {
          return this.buildHoverFromTableField(table, words[1], statement);
        }
      }
    }
    return;
  };
  Hover.prototype.buildHoverFromReference = function (
    document,
    reference,
    statement
  ) {
    if (types_1.AblTypeCheck.isTempTable(reference)) {
      return this.buildTempTableHover(reference, statement);
    } else if (types_1.AblTypeCheck.isMethod(reference)) {
      return this.buildMethodHover(reference, statement);
    } else {
      // generic parameter data
      var variable = reference;
      // variable/param as temp-table
      if (reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.TEMP_TABLE) {
        var tempTable = document.getTempTable(reference.name);
        if (tempTable) {
          return this.buildTempTableHover(tempTable, statement, variable);
        }
      }
      // variable/param as buffer
      else if (reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER) {
        if (reference.bufferType == types_1.AblType.BUFFER_REFERENCE.TABLE) {
          var table = this.dbfController.getTable(reference.likeType);
          if (table) {
            return this.buildHoverFromTable(table, statement, variable);
          }
        } else if (
          reference.bufferType == types_1.AblType.BUFFER_REFERENCE.TEMP_TABLE
        ) {
          var tempTable = document.getTempTable(reference.likeType);
          if (tempTable) {
            return this.buildTempTableHover(tempTable, statement, variable);
          }
        }
      }
      // variable
      else {
        return this.buildVariableHover(reference, statement);
      }
    }
    return;
  };
  Hover.prototype.buildHoverFromReferenceProperty = function (
    document,
    reference,
    name,
    statement
  ) {
    var _a, _b;
    var property;
    var refData;
    if (types_1.AblTypeCheck.isTempTable(reference)) {
      refData = document.getTempTable(reference.name);
      property = document.getAllFields(refData).find(function (item) {
        return item.name.toLowerCase() == name.toLowerCase();
      });
    } else if (!types_1.AblTypeCheck.isMethod(reference)) {
      // variable/param as temp-table
      if (reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.TEMP_TABLE) {
        refData = document.getTempTable(reference.name);
        property = document.getAllFields(refData).find(function (item) {
          return item.name.toLowerCase() == name.toLowerCase();
        });
      }
      // variable/param as buffer
      else if (reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER) {
        if (reference.bufferType == types_1.AblType.BUFFER_REFERENCE.TABLE) {
          refData = this.dbfController.getTable(reference.likeType);
          property =
            (_b =
              (_a = refData) === null || _a === void 0 ? void 0 : _a.fields) ===
              null || _b === void 0
              ? void 0
              : _b.find(function (item) {
                  return item.name.toLowerCase() == name.toLowerCase();
                });
        } else if (
          reference.bufferType == types_1.AblType.BUFFER_REFERENCE.TEMP_TABLE
        ) {
          refData = document.getTempTable(reference.likeType);
          property = document.getAllFields(refData).find(function (item) {
            return item.name.toLowerCase() == name.toLowerCase();
          });
        }
      }
    }
    if (property) {
      if (types_1.AblTypeCheck.isTempTable(refData)) {
        // temp-table field
        var field = property;
        var result = [];
        result.push("field **".concat(field.name, "**\n"));
        if (
          types_1.AblTypeCheck.isVariable(reference) &&
          reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER
        ) {
          result.push("- Buffer *".concat(reference.name, "*\n"));
        }
        result.push("- Temp-table *".concat(refData.name, "*\n"));
        if (field.dataType) {
          result.push("- Type: *".concat(field.dataType, "*\n"));
        } else if (field.likeType) {
          result.push("- Like: *".concat(field.likeType, "*\n"));
        }
        return new vscode.Hover(result, statement.statementRange);
      } else {
        // table (buffer) field
        var field = property;
        var result = [];
        result.push("field **".concat(field.name, "**\n"));
        result.push("*".concat(field.description, "*\n"));
        if (
          types_1.AblTypeCheck.isVariable(reference) &&
          reference.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER
        ) {
          result.push("- Buffer *".concat(reference.name, "*\n"));
        }
        result.push("- Table *".concat(refData.name, "*\n"));
        if (field.isPK) result.push("- **Primary Key**\n");
        else if (field.isKey) result.push("- **Used in index**\n");
        if (field.mandatory) result.push("- **Mandatory**\n");
        result.push("- Label: *'".concat(field.description, "'*\n"));
        result.push("- Type: *".concat(field.type, "*\n"));
        result.push("- Format *".concat(field.format, "*\n"));
        return new vscode.Hover(result, statement.statementRange);
      }
    }
    return;
  };
  Hover.prototype.buildHoverFromTable = function (table, statement, variable) {
    var _a, _b;
    var result = [];
    var pkList =
      (_b =
        (_a = table.indexes.find(function (item) {
          return item.isPK;
        })) === null || _a === void 0
          ? void 0
          : _a.fields) === null || _b === void 0
        ? void 0
        : _b.join(", ");
    if (
      (variable === null || variable === void 0 ? void 0 : variable.dataType) ==
      types_1.AblType.ATTRIBUTE_TYPE.BUFFER
    ) {
      result.push(
        "".concat(variable.scope, " buffer **").concat(variable.name, "**\n")
      );
      result.push("for table **".concat(table.name, "**"));
    } else {
      result.push("table **".concat(table.name, "**"));
    }
    result.push("*".concat(table.description, "*"));
    if (pkList) {
      result.push("PK: *".concat(pkList, "*"));
    }
    return new vscode.Hover(result, statement.wordRange);
  };
  Hover.prototype.buildHoverFromTableField = function (table, name, statement) {
    // table field
    var field = table.fields.find(function (item) {
      return item.name.toLowerCase() == name.toLowerCase();
    });
    if (field) {
      var result = [];
      result.push("field **".concat(field.name, "**\n"));
      result.push("*".concat(field.description, "*\n"));
      result.push("- Table *".concat(table.name, "*\n"));
      if (field.isPK) result.push("- **Primary Key**\n");
      else if (field.isKey) result.push("- **Used in index**\n");
      if (field.mandatory) result.push("- **Mandatory**\n");
      result.push("- Label: *'".concat(field.description, "'*\n"));
      result.push("- Type: *".concat(field.type, "*\n"));
      result.push("- Format *".concat(field.format, "*\n"));
      return new vscode.Hover(result, statement.statementRange);
    }
    return;
  };
  Hover.prototype.buildTempTableHover = function (
    tempTable,
    statement,
    variable
  ) {
    var result = [];
    if (
      (variable === null || variable === void 0 ? void 0 : variable.dataType) ==
      types_1.AblType.ATTRIBUTE_TYPE.BUFFER
    ) {
      var detail = ""
        .concat(variable.scope, " buffer **")
        .concat(variable.name, "**\n");
      if (types_1.AblTypeCheck.isParameter(variable) && variable.direction)
        detail = "".concat(variable.direction, " ").concat(detail);
      result.push("".concat(detail, "\n"));
      result.push("for temp-table **".concat(tempTable.name, "**\n"));
    } else {
      var detail = "temp-table **".concat(tempTable.name, "**\n");
      if (types_1.AblTypeCheck.isParameter(variable)) {
        detail = "".concat(variable.scope, " ").concat(detail);
        if (variable.direction)
          detail = "".concat(variable.direction, " ").concat(detail);
      }
      result.push("".concat(detail, "\n"));
    }
    // if (tempTable.referenceTable)
    //     result.push(`like *${tempTable.referenceTable}*`);
    return new vscode.Hover(result, statement.wordRange);
  };
  Hover.prototype.buildMethodHover = function (method, statement) {
    var _a;
    var result = new vscode.MarkdownString();
    result.appendMarkdown(
      ""
        .concat(method.visibility, " ")
        .concat(method.type, " **")
        .concat(method.name, "**\n")
    );
    if (
      ((_a = method.params) === null || _a === void 0 ? void 0 : _a.length) > 0
    ) {
      result.appendMarkdown("\n---\nParameters:\n");
      method.params.forEach(function (param) {
        if (param.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER) {
          result.appendMarkdown(
            "- buffer *"
              .concat(param.name, "* for ")
              .concat(param.bufferType, " *")
              .concat(param.likeType, "*\n")
          );
        } else if (
          param.dataType == types_1.AblType.ATTRIBUTE_TYPE.TEMP_TABLE
        ) {
          result.appendMarkdown(
            "- "
              .concat(param.direction, " for temp-table *")
              .concat(param.name, "*\n")
          );
        } else {
          result.appendMarkdown(
            "- ".concat(param.direction, " *").concat(param.name, "*\n")
          );
        }
      });
    }
    return new vscode.Hover(result, statement.wordRange);
  };
  Hover.prototype.buildVariableHover = function (variable, statement) {
    var result = [];
    var detail = ""
      .concat(variable.scope, " variable **")
      .concat(variable.name, "**\n");
    if (types_1.AblTypeCheck.isParameter(variable) && variable.direction)
      detail = "".concat(variable.direction, " ").concat(detail);
    result.push("".concat(detail, "\n"));
    if (variable.dataType) {
      result.push("- Type: *".concat(variable.dataType, "*\n"));
    } else if (variable.likeType) {
      result.push("- Like: *".concat(variable.likeType, "*\n"));
    }
    return new vscode.Hover(result, statement.wordRange);
  };
  return Hover;
})();
exports.Hover = Hover;
