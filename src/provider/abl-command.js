import * as vscode from "vscode"
import { AblExecute } from "../abl-execute"
import { documentDeploy } from "../deploy"

export class AblCommand {
  static attach(context) {
    let instance = new AblCommand()
    instance.registerCommands(context)
  }

  registerCommands(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.checkSyntax",
        this.currentFileCheckSyntax.bind(this)
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.compile",
        this.currentFileCompile.bind(this)
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.compileOptions",
        this.currentFileCompileWithOptions.bind(this)
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.run",
        this.currentFileRun.bind(this)
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.currentFile.deploySource",
        this.currentFileDeploySource.bind(this)
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.dictionary.dumpDefinition",
        this.dictionaryDumpDefinition.bind(this)
      )
    )
  }

  currentFileCheckSyntax() {
    AblExecute.CheckSyntax.getInstance().execute(
      vscode.window.activeTextEditor.document
    )
  }

  currentFileCompile() {
    AblExecute.Compile.getInstance().compile(
      vscode.window.activeTextEditor.document
    )
  }

  currentFileCompileWithOptions() {
    AblExecute.Compile.getInstance().compileWithOptions(
      vscode.window.activeTextEditor.document
    )
  }

  currentFileRun() {
    AblExecute.Run.getInstance().execute(
      vscode.window.activeTextEditor.document
    )
  }

  currentFileDeploySource() {
    documentDeploy(vscode.window.activeTextEditor.document)
  }

  dictionaryDumpDefinition() {
    AblExecute.DictionaryDump.getInstance().execute()
  }
}
