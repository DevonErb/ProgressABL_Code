const { vscode } = require("vscode");
const { ExtensionConfig } = require("../extension-config");
const { BaseExecutor } = require("./base-executor");

class DictionaryDump extends BaseExecutor {
  static getInstance() {
    return new DictionaryDump();
  }

  execute() {
    vscode.window.showInformationMessage("Updating dictionary...");
    let dbs = ExtensionConfig.getInstance().getConfig().dbDictionary;
    return this.executeStandaloneCommand("dict-dump.p", dbs).then((result) => {
      vscode.window.showInformationMessage(
        "Data dictionary " + (result ? "updated" : "failed")
      );
      return result;
    });
  }
}

module.exports = DictionaryDump;
