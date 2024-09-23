const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { ExtensionConfig } = require("../extension-config");
const { AblSource } = require("@oe-zext/source");

class Format {
  static attach(context) {
    let instance = new Format();
    instance.registerCommands(context);
  }

  constructor() {
    this.loadKeywordPattern();
  }

  registerCommands(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.format.upperCase",
        this.formatUpperCase.bind(this)
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.format.lowerCase",
        this.formatLowerCase.bind(this)
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "abl.format.trimRight",
        this.formatTrimRight.bind(this)
      )
    );
  }

  formatUpperCase() {
    this.applyUpperCaseKeywords(vscode.window.activeTextEditor);
  }

  formatLowerCase() {
    this.applyLowerCaseKeywords(vscode.window.activeTextEditor);
  }

  formatTrimRight() {
    this.applyTrimRight(vscode.window.activeTextEditor);
  }

  applyKeywordsFunction(editor, func) {
    let source = new AblSource.Extractor().execute(editor.document);
    let reg = RegExp(this.ablKeywordsPattern, "gim");

    editor.edit((builder) => {
      let match = reg.exec(source.sourceWithoutStrings);
      while (match) {
        let range = new vscode.Range(
          source.document.positionAt(match.index),
          source.document.positionAt(reg.lastIndex)
        );
        builder.replace(range, func(match[1]));
        match = reg.exec(source.sourceWithoutStrings);
      }
    });
  }

  applyUpperCaseKeywords(editor) {
    this.applyKeywordsFunction(editor, (text) => text.toUpperCase());
  }

  applyLowerCaseKeywords(editor) {
    this.applyKeywordsFunction(editor, (text) => text.toLowerCase());
  }

  applyTrimRight(editor) {
    let txt = editor.document.getText();
    editor.edit((builder) => {
      let range = new vscode.Range(
        new vscode.Position(0, 0),
        editor.document.positionAt(txt.length)
      );
      txt = txt
        .split("\n")
        .map((line) => line.trimRight())
        .join("\n");
      builder.replace(range, txt);
    });
  }

  loadKeywordPattern() {
    let grammarFile = path.join(
      ExtensionConfig.getInstance().getExtensionPath(),
      "grammar/abl.tmLanguage.json"
    );
    fs.readFile(grammarFile, (err, data) => {
      try {
        let jsonData = JSON.parse(data.toString());
        this.ablKeywordsPattern = jsonData?.repository?.keywords?.match || "";
        //
        this.ablKeywordsPattern = this.ablKeywordsPattern.replace("(?i)", "");
      } catch {
        this.ablKeywordsPattern = null;
      }
    });
  }
}

module.exports = Format;
