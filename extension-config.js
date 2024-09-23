const vscode = require("vscode");
const fs = require("fs");
const { isNullOrUndefined, promisify } = require("util");

const readFileAsync = promisify(fs.readFile);

class ExtensionConfig {
  // This is the config file for the extension
  openEdgeCONFIGFILENAME = ".openedgeConfig.json";

  // Name of extension
  THIS_EXTENSION = "ProgressABL_Code";

  _oezextConfig = null;
  _watcher = null;
  _genericWorkspaceFolder = null;
  static _instance = null; // Ensure a single instance if needed

  constructor(context) {
    this._extensionConfig = this; // Using 'this' to reference the instance
    this._context = context;
    this.initConfig();
    this.initWatcher();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new ExtensionConfig();
    }
    return this._instance;
  }

  findConfigFile() {
    return vscode.workspace
      .findFiles(this.openEdgeCONFIGFILENAME)
      .then((uris) => {
        if (uris.length > 0) {
          return uris[0];
        }
        return null;
      });
  }

  loadAndSetConfigFile(uri) {
    if (isNullOrUndefined(uri)) {
      return;
    }
    this.loadFile(uri.fsPath).then((config) => {
      this._oezextConfig = config;
      if (!this._genericWorkspaceFolder)
        this._genericWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    });
  }

  initWatcher() {
    this._watcher = vscode.workspace.createFileSystemWatcher(
      "**/" + this.openEdgeCONFIGFILENAME
    ); // Removed semicolon
    this._watcher.onDidChange((uri) => this.loadAndSetConfigFile(uri));
    this._watcher.onDidCreate((uri) => this.loadAndSetConfigFile(uri));
    this._watcher.onDidDelete((uri) => this.loadAndSetConfigFile(uri));
  }

  initConfig() {
    this.findConfigFile().then((uri) => this.loadAndSetConfigFile(uri));
  }

  loadFile(filename) {
    if (!filename) return Promise.resolve({});
    return readFileAsync(filename, { encoding: "utf8" }).then((text) => {
      return JSON.parse(text);
    });
  }

  getContext() {
    return this._context;
  }

  getConfig(mergeConfig) {
    let result = this._oezextConfig || {};
    if (isNullOrUndefined(mergeConfig)) return result;
    // Deep copy from config
    else
      return Object.assign({}, JSON.parse(JSON.stringify(result)), mergeConfig);
  }

  getGenericWorkspaceFolder() {
    return this._genericWorkspaceFolder;
  }

  getExtensionPath() {
    return vscode.extensions.getExtension(this.THIS_EXTENSION).extensionPath;
  }
}

module.exports = ExtensionConfig;
