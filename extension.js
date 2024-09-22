//consts vscode because we are in the src directory
//const { vscode } = require('vscode');
const vscode = require('vscode');

// package.json package-lock.json
//const { AblDatabase } = require('@oe-zext/database');
//const { AblSource } = require('@oe-zext/source');
//const { AblSchema } = require('@oe-zext/types');
const {AblDatabase} = require("@oe-zext/database");
const {AblSource} = require("@oe-zext/source");
const {AblSchema} = require("@oe-zext/types");

// provider/index.js index-provider.js
//const { Provider } = require('./provider');
const {Provider} = require("./provider");

// notification.js
/*const {
  hideStatusBar,
  initDiagnostic,
  updateStatusBar,
  initStatusBar,
} = require('./notification');;*/
const {
  hideStatusBar,
  initDiagnostic,
  updateStatusBar,
  initStatusBar,
} = require("./notification");

//extension-config.js
//const { ExtensionConfig } = require('./extension-config');
const { ExtensionConfig } = require("./extension-config");
// abl-execute/index.js
//const { AblExecute } = require('./abl-execute');
const { AblExecute } = require("./abl-execute");
/**
 * This activates the extension
 */
//export function activate(context) {
exports.activate = function(context){
  //extension configuration
  new ExtensionConfig(context);

  //Setup Database tables
  initAblDatabaseController(context);

  //These three are for checking syntax
  initOnSaveWatcher(context);
  initOnCloseWatcher(context);
  initOnChangeActiveTextWatcher(context);

  //this
  attachExtensions(context);

  //from src/notification.js
  initDiagnostic(context);
  initStatusBar(context);

  return{};
};

function deactivate() {}

/**
 * This function sets up the abl database controller
 * with the database file dumped from:
 * progress_abl_oe-zext_code/DatabaseTable_Dump.p
 */
function initAblDatabaseController(context) {
  const DBF_PATTERN = "**/.oe-zext-AllTables.db.*";
  const DBF_DBNAME_REGEX = /\.oe-zext-AllTables\.db\.(\w+)$/i;

  context.subscriptions.push(
    AblDatabase.Controller.attach(DBF_PATTERN, DBF_DBNAME_REGEX)
  );

  context.subscriptions.push(AblSource.Controller.attach(context));
}

function initOnSaveWatcher(context) {
  // TODO -------------------------------------------------------

  vscode.workspace.onDidSaveTextDocument((document) =>
    hideStatusBar(document.uri.fsPath)
  );

  let ablConfig = vscode.workspace.getConfiguration(AblSchema.languageId);
  if (ablConfig.get("checkSyntaxOnSave") === "file") {
    vscode.workspace.onDidSaveTextDocument(
      (document) => {
        if (document.languageId !== AblSchema.languageId) {
          return;
        }
        AblExecute.CheckSyntax.getInstance().execute(document);
      },
      null,
      context.subscriptions
    );
  }
}

function initOnCloseWatcher(context) {
  // TODO -------------------------------------------------------

  vscode.workspace.onDidCloseTextDocument((document) =>
    hideStatusBar(document.uri.fsPath)
  );
}

function initOnChangeActiveTextWatcher(context) {
  // TODO -------------------------------------------------------

  vscode.window.onDidChangeActiveTextEditor((editor) => updateStatusBar());
}

function attachExtensions(context) {
  //provider/abl-command.js
  Provider.AblCommand.attach(context);
  //provider/code-completion.js
  Provider.CodeCompletion.attach(context);
  //provider/definition.js
  Provider.Definition.attach(context);
  //provider/format.js
  Provider.Format.attach(context);
  //provider/hover.js
  Provider.Hover.attach(context);
  //provider/key-binding.js
  Provider.KeyBinding.attach(context);
  //provider/symbol.js
  Provider.Symbol.attach(context);
  //provider/signature.js
  Provider.Signature.attach(context);
  //provider/integration.js
  Provider.Integration.attach(context);
  //provider/terminal.js
  Provider.Terminal.attach(context);
}
