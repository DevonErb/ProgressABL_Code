// check this one
"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null"
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compile = exports.COMPILE_OPTIONS = void 0;

//var vscode = require("vscode");
import vscode from "vscode";
//var path = require("path");
import path from "path";
//var notification_1 = require("../notification");
import notification_1 from "../notification";
//var extension_config_1 = require("../extension-config");
import extension_config_1 from "../extension-config";
//var deploy_1 = require("../deploy");
import deploy_1 from "../deploy";
//var base_executor_1 = require("./base-executor");
import base_executor_1 from "./base-executor";
//var process_1 = require("./process");
import process_1 from "./process";

var COMPILE_OPTIONS;
(function (COMPILE_OPTIONS) {
  COMPILE_OPTIONS["COMPILE"] = "COMPILE";
  COMPILE_OPTIONS["LISTING"] = "LISTING";
  COMPILE_OPTIONS["XREF"] = "XREF";
  COMPILE_OPTIONS["XREFXML"] = "XREF-XML";
  COMPILE_OPTIONS["STRINGXREF"] = "STRING-XREF";
  COMPILE_OPTIONS["DEBUGLIST"] = "DEBUG-LIST";
  COMPILE_OPTIONS["PREPROCESS"] = "PREPROCESS";
  COMPILE_OPTIONS["XCODE"] = "XCODE";
})(
  (COMPILE_OPTIONS = exports.COMPILE_OPTIONS || (exports.COMPILE_OPTIONS = {}))
);
var Compile = /** @class */ (function (_super) {
  __extends(Compile, _super);
  function Compile() {
    var _this = _super.call(this) || this;
    _this.errorDiagnostic = notification_1.errorDiagnosticCollection;
    _this.warningDiagnostic = notification_1.warningDiagnosticCollection;
    return _this;
  }
  Compile.getInstance = function () {
    return new Compile();
  };
  Compile.prototype.compile = function (document, silent) {
    return this.execute(document, null, silent, [COMPILE_OPTIONS.COMPILE]);
  };
  Compile.prototype.compileWithOptions = function (document) {
    var _this = this;
    var options = Object.keys(COMPILE_OPTIONS).map(function (k) {
      return COMPILE_OPTIONS[k];
    });
    var pick = new Promise(function (resolve) {
      return resolve(
        vscode.window.showQuickPick(options, {
          placeHolder: "Compile option",
          canPickMany: true,
        })
      );
    });
    return pick.then(function (opts) {
      if (opts) return _this.execute(document, null, false, opts);
      return Promise.resolve(null);
    });
  };
  Compile.prototype.execute = function (
    document,
    mergeOeConfig,
    silent,
    compileOptions
  ) {
    var _this = this;
    if (!silent) {
      (0, notification_1.showStatusBar)(
        document.uri.fsPath,
        "Compiling...",
        notification_1.STATUS_COLOR.INFO
      );
    }
    var oeConfig =
      extension_config_1.ExtensionConfig.getInstance().getConfig(mergeOeConfig);
    var wf = vscode.workspace.getWorkspaceFolder(document.uri);
    var wsPath = wf ? wf.uri.fsPath : path.dirname(document.uri.fsPath);
    // PARAMS
    // 1 = filename
    // 2 = output path
    // 3 = compile options (pipe separated)
    var params = [document.uri.fsPath];
    if (
      oeConfig.deployment &&
      oeConfig.deployment.find(function (item) {
        return (
          item.taskType == deploy_1.TASK_TYPE.DEPLOY_RCODE ||
          item.taskType == deploy_1.TASK_TYPE.DEPLOY_ALL
        );
      })
    )
      params.push(wsPath);
    else params.push(""); // output path (.R) only if has post actions
    params.push(
      Object.keys(compileOptions)
        .map(function (k) {
          return compileOptions[k];
        })
        .join("|")
    );
    //
    return this.executeCommand(
      document,
      "compile.p",
      params,
      mergeOeConfig,
      silent
    )
      .then(function (result) {
        if (result) {
          _this.postActions(document, silent, compileOptions);
        }
        return result;
      })
      .then(function (result) {
        if (!silent) {
          if (result)
            (0, notification_1.showStatusBar)(
              document.uri.fsPath,
              "Compiled",
              notification_1.STATUS_COLOR.SUCCESS
            );
          else
            (0, notification_1.showStatusBar)(
              document.uri.fsPath,
              "Syntax error",
              notification_1.STATUS_COLOR.ERROR
            );
        }
        return result;
      });
  };
  Compile.prototype.postActions = function (document, silent, compileOptions) {
    // post actions don't execute on silent mode && inside workspace folder
    var wf = vscode.workspace.getWorkspaceFolder(document.uri);
    if (silent || !wf) {
      return;
    }
    compileOptions.forEach(function (opt) {
      switch (opt) {
        case COMPILE_OPTIONS.COMPILE:
          (0, deploy_1.rcodeDeploy)(wf, document.uri.fsPath);
          break;
        case COMPILE_OPTIONS.LISTING:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".listing", ".listing", [deploy_1.TASK_TYPE.DEPLOY_LISTING, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.XREF:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".xref", ".xref", [deploy_1.TASK_TYPE.DEPLOY_XREF, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.XREFXML:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".xref-xml", ".xref-xml", [deploy_1.TASK_TYPE.DEPLOY_XREFXML, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.STRINGXREF:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".string-xref", ".string-xref", [deploy_1.TASK_TYPE.DEPLOY_STRINGXREF, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.DEBUGLIST:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".debug-list", ".debug-list", [deploy_1.TASK_TYPE.DEPLOY_DEBUGLIST, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.PREPROCESS:
          (0,
          deploy_1.fileDeploy)(wf, document.uri.fsPath + ".preprocess", ".preprocess", [deploy_1.TASK_TYPE.DEPLOY_PREPROCESS, deploy_1.TASK_TYPE.DEPLOY_ALL]);
          break;
        case COMPILE_OPTIONS.XCODE:
          process_1.Process.xcode(wf, document.uri.fsPath + ".xcode").then(
            function (ok) {
              if (ok)
                (0, deploy_1.fileDeploy)(
                  wf,
                  document.uri.fsPath + ".xcode",
                  ".xcode",
                  [
                    deploy_1.TASK_TYPE.DEPLOY_XCODE,
                    deploy_1.TASK_TYPE.DEPLOY_ALL,
                  ]
                );
            }
          );
          break;
      }
    });
  };
  return Compile;
})(base_executor_1.BaseExecutor);
exports.Compile = Compile;
