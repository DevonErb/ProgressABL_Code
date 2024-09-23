//const\s+([\w\s,{}*]+)\s+from\s+['"](.+?)['"];
// const $1 = require('$2');
//\{\s*\{\s*(\w+)\s*\}\s*\}
//{ $1 }
const {
  showStatusBar,
  STATUS_COLOR,
  errorDiagnosticCollection,
  warningDiagnosticCollection,
} = require("../notification");

const { BaseExecutor } = require("./base-executor");

class CheckSyntax extends BaseExecutor {
  constructor() {
    super();
    this.errorDiagnostic = errorDiagnosticCollection;
    this.warningDiagnostic = warningDiagnosticCollection;
  }

  static getInstance() {
    return new CheckSyntax();
  }

  execute(document, mergeOeConfig, silent) {
    if (!silent) {
      showStatusBar(document.uri.fsPath, "Checking syntax", STATUS_COLOR.INFO);
    }
    return this.executeCommand(
      document,
      "check-syntax.p",
      [document.uri.fsPath],
      mergeOeConfig,
      silent
    ).then((result) => {
      if (!silent) {
        if (result)
          showStatusBar(document.uri.fsPath, "Syntax OK", STATUS_COLOR.SUCCESS);
        else
          showStatusBar(
            document.uri.fsPath,
            "Syntax error",
            STATUS_COLOR.ERROR
          );
      }
      return result;
    });
  }
}

module.exports = CheckSyntax;
