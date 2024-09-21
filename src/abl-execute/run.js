import {
    showStatusBar,
    STATUS_COLOR,
    errorDiagnosticCollection,
    warningDiagnosticCollection,
    hideStatusBar
  } from "../notification"
  import { BaseExecutor } from "./base-executor"
  
  export class Run extends BaseExecutor {
    constructor() {
      super()
      this.errorDiagnostic = errorDiagnosticCollection
      this.warningDiagnostic = warningDiagnosticCollection
    }
  
    static getInstance() {
      return new Run()
    }
  
    getBinary() {
      return this.ablEnvironment.prowinBin
    }
  
    isBatch() {
      return false
    }
  
    execute(document, mergeOeConfig, silent) {
      if (!silent) {
        showStatusBar(document.uri.fsPath, "Running", STATUS_COLOR.INFO)
      }
      return this.executeCommand(
        document,
        "run.p",
        [document.uri.fsPath],
        mergeOeConfig,
        silent
      ).then(result => {
        if (!silent) {
          if (result) hideStatusBar(document.uri.fsPath)
          else
            showStatusBar(document.uri.fsPath, "Syntax error", STATUS_COLOR.ERROR)
        }
        return result
      })
    }
  }
  