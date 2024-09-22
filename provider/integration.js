//check this one

"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };

Object.defineProperty(exports, "__esModule", { value: true });
exports.Integration = void 0;

//var vscode = require("vscode");
const vscode = require("vscode");
//var path = require("path");
const { path } = require('path');
//var fs = require("fs");
const { fs } = require('fs');
//var database_1 = require("@oe-zext/database");
const { database_1 } = require('@oe-zext/database');
//var abl_execute_1 = require("../abl-execute");
const { abl_execute_1 } = require('../abl-execute');
//var source_1 = require("@oe-zext/source");
const { source_1 } = require('@oe-zext/source');
//var types_1 = require("@oe-zext/types");
const { types_1 } = require('@oe-zext/types');
//var util_1 = require("util");
const { util_1 } = require('util');

/**
 * Provider for integration commands (usually hidden from command palette).
 * Can be used by other VSCode extensions.
 */
var Integration = /** @class */ (function () {
  function Integration() {}
  Integration.attach = function (context) {
    var instance = new Integration();
    instance.registerCommands(context);
  };
  Integration.prototype.registerCommands = function (context) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.saveMap",
        this.currentFileSaveMap.bind(this)
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.getMap",
        this.currentFileGetMap.bind(this)
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.getSourceCode",
        this.currentFileGetSourceCode.bind(this)
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand("abl.tables", this.tables.bind(this))
    );
    context.subscriptions.push(
      vscode.commands.registerCommand("abl.table", this.table.bind(this))
    );
    context.subscriptions.push(
      vscode.commands.registerCommand("abl.compile", this.compile.bind(this))
    );
    context.subscriptions.push(
      vscode.commands.registerCommand("abl.getMap", this.fileGetMap.bind(this))
    );
  };
  Integration.prototype.currentFileSaveMap = function (args) {
    var doc = vscode.window.activeTextEditor.document;
    var filename = null;
    if (args) {
      if ((0, util_1.isArray)(args) && args.length > 0) filename = args[0];
      else filename = args;
    }
    this.saveMapFile(doc, filename);
    return filename;
  };
  Integration.prototype.saveMapFile = function (textDocument, filename) {
    var document =
      source_1.AblSource.Controller.getInstance().getDocument(textDocument);
    if (document) {
      var save_1 = function (fname, showMessage) {
        var data = IntegrationV1.Generate.map(document);
        if (data) {
          fs.writeFileSync(fname, JSON.stringify(data));
          if (showMessage)
            vscode.window.showInformationMessage(
              "File " + path.basename(fname) + " created!"
            );
        } else if (showMessage) {
          vscode.window.showErrorMessage("Error mapping file");
        }
      };
      //
      if (filename) {
        save_1(filename, false);
      } else {
        var opt = {
          prompt: "Save into file",
          value: document.document.uri.fsPath + ".oe-map.json",
        };
        vscode.window.showInputBox(opt).then(function (fname) {
          if (fname) save_1(fname, true);
        });
      }
    }
  };
  Integration.prototype.currentFileGetMap = function () {
    var textDocument = vscode.window.activeTextEditor.document;
    if (textDocument) {
      var document =
        source_1.AblSource.Controller.getInstance().getDocument(textDocument);
      if (document) {
        return IntegrationV1.Generate.map(document);
      }
    }
    return {};
  };
  Integration.prototype.currentFileGetSourceCode = function () {
    var doc = vscode.window.activeTextEditor.document;
    if (doc) return new source_1.AblSource.Extractor().execute(doc);
    return;
  };
  Integration.prototype.tables = function () {
    return IntegrationV1.Generate.tables();
  };
  Integration.prototype.table = function (tableName) {
    return IntegrationV1.Generate.table(tableName);
  };
  Integration.prototype.compile = function (fileName, mergeOeConfig) {
    return new Promise(function (resolve) {
      vscode.workspace.openTextDocument(fileName).then(function (textDocument) {
        abl_execute_1.AblExecute.Compile.getInstance()
          .execute(textDocument, mergeOeConfig, true, [
            abl_execute_1.AblExecute.COMPILE_OPTIONS.COMPILE,
          ])
          .then(function (v) {
            return resolve(v);
          });
      });
    });
  };
  Integration.prototype.fileGetMap = function (fsPath) {
    var document = source_1.AblSource.Controller.getInstance().getDocument(
      vscode.Uri.file(fsPath)
    );
    if (document) {
      return IntegrationV1.Generate.map(document);
    }
    return {};
  };
  return Integration;
})();
exports.Integration = Integration;
var IntegrationV1;
(function (IntegrationV1) {
  var Generate = /** @class */ (function () {
    function Generate() {}
    Generate.map = function (document) {
      var _tempTables = document.tempTables.map(function (tempTable) {
        var ttFields = __spreadArray(
          __spreadArray([], tempTable.fields, true),
          tempTable.referenceFields || [],
          true
        ).map(function (field) {
          return {
            name: field.name,
            asLike: field.dataType ? "as" : "like",
            dataType: field.dataType ? field.dataType : field.likeType,
            line: tempTable.range.start.line,
          };
        });
        return {
          label: tempTable.name,
          fields: ttFields,
        };
      });
      var _methods = document.methods.map(function (method) {
        return {
          name: method.name,
          lineAt: method.range.start.line,
          lineEnd: method.range.end.line,
          params: method.params.map(function (param) {
            var additional;
            if (param.dataType == types_1.AblType.ATTRIBUTE_TYPE.BUFFER) {
              additional = param.likeType;
            } else {
              additional = param.additional;
            }
            return {
              name: param.name,
              asLike: param.dataType ? "as" : "like",
              dataType: param.dataType || param.likeType,
              direction: param.direction,
              line: param.position.line,
              additional: additional,
            };
          }),
        };
      });
      var _includes = document.includes
        .filter(function (include) {
          return !!include.uri;
        })
        .map(function (include) {
          var _a;
          var includeMap;
          var includeDocument =
            source_1.AblSource.Controller.getInstance().getDocument(
              include.uri
            );
          if (includeDocument) {
            includeMap = Generate.map(includeDocument);
          }
          return {
            fsPath:
              (_a = include.uri) === null || _a === void 0 ? void 0 : _a.fsPath,
            name: include.name,
            map: includeMap,
          };
        });
      return {
        methods: _methods,
        // variables: this._vars,
        tempTables: _tempTables,
        includes: _includes,
        // external: this.externalDocument
      };
    };
    Generate.table = function (tableName) {
      return database_1.AblDatabase.Controller.getInstance().getTable(
        tableName
      );
    };
    Generate.tables = function () {
      return database_1.AblDatabase.Controller.getInstance()
        .getCollection()
        .map(function (item) {
          return item.name;
        });
    };
    return Generate;
  })();
  IntegrationV1.Generate = Generate;
})(IntegrationV1 || (IntegrationV1 = {}));
