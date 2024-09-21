import * as vscode from "vscode"
import * as fs from "fs"
import { isNullOrUndefined, promisify } from "util"

const readFileAsync = promisify(fs.readFile)

let _extensionConfig

export class ExtensionConfig {
  OPENEDGE_CONFIG_FILENAME = ".openedge-zext.json"
  THIS_EXTENSION = "ezequielgandolfi.openedge-zext"

  _openEdgeConfig = null
  _watcher = null
  _genericWorkspaceFolder = null

  constructor(context) {
    _extensionConfig = this
    this._context = context
    this.initConfig()
    this.initWatcher()
  }

  static getInstance() {
    return _extensionConfig
  }

  findConfigFile() {
    return vscode.workspace
      .findFiles(this.OPENEDGE_CONFIG_FILENAME)
      .then(uris => {
        if (uris.length > 0) {
          return uris[0]
        }
        return null
      })
  }

  loadAndSetConfigFile(uri) {
    if (isNullOrUndefined(uri)) {
      return
    }
    this.loadFile(uri.fsPath).then(config => {
      this._openEdgeConfig = config
      if (!this._genericWorkspaceFolder)
        this._genericWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
    })
  }

  initWatcher() {
    this._watcher = vscode.workspace.createFileSystemWatcher(
      "**/" + this.OPENEDGE_CONFIG_FILENAME
    )
    this._watcher.onDidChange(uri => this.loadAndSetConfigFile(uri))
    this._watcher.onDidCreate(uri => this.loadAndSetConfigFile(uri))
    this._watcher.onDidDelete(uri => this.loadAndSetConfigFile(uri))
  }

  initConfig() {
    this.findConfigFile().then(uri => this.loadAndSetConfigFile(uri))
  }

  loadFile(filename) {
    if (!filename) return Promise.resolve({})
    return readFileAsync(filename, { encoding: "utf8" }).then(text => {
      return JSON.parse(text)
    })
  }

  getContext() {
    return this._context
  }

  getConfig(mergeConfig) {
    let result = this._openEdgeConfig || {}
    if (isNullOrUndefined(mergeConfig)) return result
    // deep copy from config
    else
      return Object.assign({}, JSON.parse(JSON.stringify(result)), mergeConfig)
  }

  getGenericWorkspaceFolder() {
    return this._genericWorkspaceFolder
  }

  getExtensionPath() {
    return vscode.extensions.getExtension(this.THIS_EXTENSION).extensionPath
  }
}
