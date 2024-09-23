const vscode = require("vscode");
const { isNullOrUndefined } = require("util");

let outputChannel = vscode.window.createOutputChannel("oe-zext");
let statusMessages = [];
let statusBarEntry;

let errorDiagnosticCollection;
let warningDiagnosticCollection;

let STATUS_COLOR;
(function (STATUS_COLOR) {
  STATUS_COLOR["INFO"] = "yellow";
  STATUS_COLOR["SUCCESS"] = "lime";
  STATUS_COLOR["ERROR"] = "violet";
})(STATUS_COLOR || (STATUS_COLOR = {}));

function updateStatusBar() {
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) updateDocumentStatusBar(activeEditor.document.uri.fsPath);
  else updateDocumentStatusBar();
}

function updateDocumentStatusBar(fsPath) {
  statusBarEntry.hide();

  if (!isNullOrUndefined(fsPath)) {
    let msg = statusMessages.find((item) => item.fsPath == fsPath);
    if (!isNullOrUndefined(msg) && msg.active) {
      statusBarEntry.text = msg.text;
      statusBarEntry.color = msg.color;
      statusBarEntry.show();
    }
  }
}

function hideStatusBar(fsPath) {
  let idx = statusMessages.findIndex((item) => item.fsPath == fsPath);
  if (idx >= 0) {
    statusMessages.splice(idx, 1);
  }
  updateStatusBar();
}

function showStatusBar(fsPath, message, status) {
  let msg = statusMessages.find((item) => item.fsPath == fsPath);
  if (isNullOrUndefined(msg)) {
    msg = { fsPath: fsPath };
    statusMessages.push(msg);
  }
  msg.text = message;
  msg.color = status;
  msg.active = true;
  updateStatusBar();
}

function initDiagnostic(context) {
  errorDiagnosticCollection =
    vscode.languages.createDiagnosticCollection("abl-error");
  context.subscriptions.push(errorDiagnosticCollection);
  warningDiagnosticCollection =
    vscode.languages.createDiagnosticCollection("abl-warning");
  context.subscriptions.push(warningDiagnosticCollection);
}

function initStatusBar(context) {
  statusBarEntry = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    Number.MIN_VALUE
  );
  context.subscriptions.push(statusBarEntry);
}

module.exports = {
  initStatusBar,
  initDiagnostic,
  showStatusBar,
  hideStatusBar,
  updateStatusBar,
  STATUS_COLOR,
  warningDiagnosticCollection,
  errorDiagnosticCollection,
  outputChannel,
};
