import * as vscode from "vscode"
import { isNullOrUndefined } from "util"

export let outputChannel = vscode.window.createOutputChannel("OpenEdge")
let statusMessages = []
let statusBarEntry

export let errorDiagnosticCollection
export let warningDiagnosticCollection

export let STATUS_COLOR

;(function(STATUS_COLOR) {
  STATUS_COLOR["INFO"] = "yellow"
  STATUS_COLOR["SUCCESS"] = "lime"
  STATUS_COLOR["ERROR"] = "violet"
})(STATUS_COLOR || (STATUS_COLOR = {}))

export function updateStatusBar() {
  let activeEditor = vscode.window.activeTextEditor
  if (activeEditor) updateDocumentStatusBar(activeEditor.document.uri.fsPath)
  else updateDocumentStatusBar()
}

function updateDocumentStatusBar(fsPath) {
  statusBarEntry.hide()

  if (!isNullOrUndefined(fsPath)) {
    let msg = statusMessages.find(item => item.fsPath == fsPath)
    if (!isNullOrUndefined(msg) && msg.active) {
      statusBarEntry.text = msg.text
      statusBarEntry.color = msg.color
      statusBarEntry.show()
    }
  }
}

export function hideStatusBar(fsPath) {
  let idx = statusMessages.findIndex(item => item.fsPath == fsPath)
  if (idx >= 0) {
    statusMessages.splice(idx, 1)
  }
  updateStatusBar()
}

export function showStatusBar(fsPath, message, status) {
  let msg = statusMessages.find(item => item.fsPath == fsPath)
  if (isNullOrUndefined(msg)) {
    msg = { fsPath: fsPath }
    statusMessages.push(msg)
  }
  msg.text = message
  msg.color = status
  msg.active = true
  updateStatusBar()
}

export function initDiagnostic(context) {
  errorDiagnosticCollection = vscode.languages.createDiagnosticCollection(
    "abl-error"
  )
  context.subscriptions.push(errorDiagnosticCollection)
  warningDiagnosticCollection = vscode.languages.createDiagnosticCollection(
    "abl-warning"
  )
  context.subscriptions.push(warningDiagnosticCollection)
}

export function initStatusBar(context) {
  statusBarEntry = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    Number.MIN_VALUE
  )
  context.subscriptions.push(statusBarEntry)
}
