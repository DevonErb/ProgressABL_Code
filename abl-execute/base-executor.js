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
exports.BaseExecutor = void 0;

//var vscode = require("vscode");
const vscode = require("vscode");
//var cp = require("child_process");
const { cp } = require('child_process');
//var path = require("path");
const { path } = require('path');
//var notification_1 = require("../notification");
const { notification_1 } = require('../notification');
//var environment_1 = require("./environment");
const { environment_1 } = require('./environment');
//var extension_config_1 = require("../extension-config");
const { extension_config_1 } = require('../extension_config_1');
//var types_1 = require("@oe-zext/types");
const { types_1 } = require('@oe-zext/types');

var BaseExecutor = /** @class */ (function () {
  function BaseExecutor() {
    this.ablEnvironment = environment_1.AblEnvironment.getInstance();
  }
  BaseExecutor.prototype.mapSeverity = function (ablSeverity) {
    switch (ablSeverity) {
      case "error":
        return vscode.DiagnosticSeverity.Error;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      // case 'info': return vscode.DiagnosticSeverity.Information;
    }
    // default
    return vscode.DiagnosticSeverity.Error;
  };
  BaseExecutor.prototype.mapResult = function (err, stdout, stderr) {
    try {
      if (err && err.code === "ENOENT") {
        return [];
      }
      var useStdErr = false;
      if (err && stderr && !useStdErr) {
        notification_1.outputChannel.appendLine(stderr);
        return [];
      }
      var lines = stdout
        .toString()
        .split("\r\n")
        .filter(function (line) {
          return line.length > 0;
        });
      if (lines.length === 1 && lines[0].startsWith("SUCCESS")) {
        return [];
      }
      var results_1 = [];
      // &1 File:'&2' Row:&3 Col:&4 Error:&5 Message:&6
      var re_1 =
        /(ERROR|WARNING) File:'(.*)' Row:(\d+) Col:(\d+) Error:(.*) Message:(.*)/;
      lines.forEach(function (line) {
        var matches = line.match(re_1);
        if (matches) {
          var checkResult = {
            file: matches[2],
            line: parseInt(matches[3]),
            column: parseInt(matches[4]),
            msg: "".concat(matches[5], ": ").concat(matches[6]),
            severity: matches[1].toLowerCase(),
          };
          results_1.push(checkResult);
        } else throw line;
      });
      return results_1;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
  BaseExecutor.prototype.getBinary = function () {
    return this.ablEnvironment.progressBin;
  };
  BaseExecutor.prototype.isBatch = function () {
    return true;
  };
  BaseExecutor.prototype.executeCommand = function (
    document,
    procedure,
    params,
    mergeOeConfig,
    silent
  ) {
    var _this = this;
    if (document.languageId !== types_1.AblSchema.languageId) {
      return;
    }
    var uri = document.uri;
    var wf = vscode.workspace.getWorkspaceFolder(uri);
    if (!wf)
      wf =
        extension_config_1.ExtensionConfig.getInstance().getGenericWorkspaceFolder();
    var doCommand = function () {
      if (!silent) _this.setDiagnostic(document, []);
      var result = _this.runProcess(
        procedure,
        params.join(","),
        mergeOeConfig,
        wf.uri.fsPath
      );
      return result
        .then(function (errors) {
          if (!silent) _this.setDiagnostic(document, errors);
          if (errors.length > 0) return false;
          return true;
        })
        .catch(function (e) {
          vscode.window.showInformationMessage(e);
          return false;
        });
    };
    return this.saveAndExec(document, doCommand);
  };
  BaseExecutor.prototype.executeStandaloneCommand = function (
    procedure,
    params,
    mergeOeConfig,
    silent
  ) {
    var _this = this;
    var wf;
    if (vscode.window.activeTextEditor) {
      wf = vscode.workspace.getWorkspaceFolder(
        vscode.window.activeTextEditor.document.uri
      );
    }
    if (!wf) {
      wf =
        extension_config_1.ExtensionConfig.getInstance().getGenericWorkspaceFolder();
    }
    var doCommand = function () {
      var result = _this.runProcess(
        procedure,
        params.join(","),
        mergeOeConfig,
        wf.uri.fsPath
      );
      return result
        .then(function (errors) {
          return true;
        })
        .catch(function (e) {
          vscode.window.showInformationMessage(e);
          return false;
        });
    };
    return doCommand();
  };
  BaseExecutor.prototype.setDiagnostic = function (document, errors) {
    var _this = this;
    if (this.errorDiagnostic) this.errorDiagnostic.clear();
    if (this.warningDiagnostic) this.warningDiagnostic.clear();
    var diagnosticMap = new Map();
    var wf = vscode.workspace.getWorkspaceFolder(document.uri);
    errors.forEach(function (error) {
      var fileUri = vscode.Uri.file(error.file);
      var filePath = fileUri.path;
      var fileWf = vscode.workspace.getWorkspaceFolder(fileUri);
      if (!fileWf) {
        // includes
        filePath = vscode.Uri.joinPath(wf.uri, error.file).path;
      }
      var startColumn = 0;
      var endColumn = 1;
      if (error.line > 0) {
        if (document && document.uri.path == filePath) {
          var range_1 = new vscode.Range(
            error.line - 1,
            startColumn,
            error.line - 1,
            document.lineAt(error.line - 1).range.end.character + 1
          );
          var text = document.getText(range_1);
          var _a = /^(\s*).*(\s*)$/.exec(text),
            _ = _a[0],
            leading = _a[1],
            trailing = _a[2];
          startColumn = startColumn + leading.length;
          endColumn = text.length - trailing.length;
        }
        var range = new vscode.Range(
          error.line - 1,
          startColumn,
          error.line - 1,
          endColumn
        );
        var severity = _this.mapSeverity(error.severity);
        var diagnostic = new vscode.Diagnostic(range, error.msg, severity);
        var diagnostics = diagnosticMap.get(filePath);
        if (!diagnostics) {
          diagnostics = new Map();
        }
        if (!diagnostics[severity]) {
          diagnostics[severity] = [];
        }
        diagnostics[severity].push(diagnostic);
        diagnosticMap.set(filePath, diagnostics);
      }
    });
    diagnosticMap.forEach(function (diagMap, file) {
      if (_this.errorDiagnostic)
        _this.errorDiagnostic.set(
          vscode.Uri.parse(file),
          diagMap[vscode.DiagnosticSeverity.Error]
        );
      if (_this.warningDiagnostic)
        _this.warningDiagnostic.set(
          vscode.Uri.parse(file),
          diagMap[vscode.DiagnosticSeverity.Warning]
        );
    });
  };
  BaseExecutor.prototype.runProcess = function (
    procedure,
    param,
    mergeOeConfig,
    workspaceRoot
  ) {
    var cmd = this.getBinary();
    var oeConfig =
      extension_config_1.ExtensionConfig.getInstance().getConfig(mergeOeConfig);
    var env = this.ablEnvironment.setupEnvironmentVariables(
      process.env,
      oeConfig,
      workspaceRoot
    );
    var args = this.ablEnvironment.createProArgs({
      parameterFiles: oeConfig.parameterFiles,
      configFile: oeConfig.configFile,
      batchMode: this.isBatch(),
      startupProcedure: path.join(
        extension_config_1.ExtensionConfig.getInstance().getExtensionPath(),
        "abl-src/".concat(procedure)
      ),
      param: param,
      workspaceRoot: workspaceRoot,
    });
    var cwd = oeConfig.workingDirectory
      ? oeConfig.workingDirectory
          .replace("${workspaceRoot}", workspaceRoot)
          .replace("${workspaceFolder}", workspaceRoot)
      : workspaceRoot;
    var mapResult = this.mapResult.bind(this);
    return new Promise(function (resolve, reject) {
      cp.execFile(
        cmd,
        args,
        { env: env, cwd: cwd },
        function (err, stdout, stderr) {
          try {
            resolve(mapResult(err, stdout, stderr));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };
  BaseExecutor.prototype.saveAndExec = function (document, action) {
    if (document.isDirty) {
      return new Promise(function (resolve, reject) {
        var _a;
        (_a = vscode.window).showInformationMessage
          .apply(
            _a,
            __spreadArray(
              ["Current file has unsaved changes!"],
              ["Save", "Cancel"],
              false
            )
          )
          .then(function (result) {
            if (result == "Save")
              document.save().then(function (saved) {
                if (saved) {
                  action().then(function (v) {
                    return resolve(v);
                  });
                }
              });
            else resolve(false);
          });
      });
    } else
      return action().then(function (value) {
        return value;
      });
  };
  return BaseExecutor;
})();
exports.BaseExecutor = BaseExecutor;
