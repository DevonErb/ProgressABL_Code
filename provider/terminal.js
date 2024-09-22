const vscode = require('vscode');

export class Terminal {
  static attach(context) {
    let instance = new Terminal()
    instance.registerCommands(context)
  }

  registerCommands(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand("abl.terminal.open", () => {
        this.terminalOpen()
      })
    )
  }

  terminalOpen() {
    oe-zextTerminal.createTeminal()
  }
}

class oe-zextTerminal {
  writeEmitter = new vscode.EventEmitter()
  lineCommand = ""

  COLOR_WHITE = 0
  COLOR_BLACK = 30
  COLOR_RED = 31
  COLOR_GREEN = 32
  COLOR_YELLOW = 33
  COLOR_BLUE = 34
  COLOR_MAGENTA = 35
  COLOR_CYAN = 36

  CMD_HELP = "help"
  CMD_COMPILE = "compile"
  CMD_DEPLOY = "deploy"

  // private readonly COLOR_BG_RED = 41;

  static createTeminal() {
    let instance = new oe-zextTerminal()
    instance.lineCommand = ""
    instance.terminal = {
      onDidWrite: instance.writeEmitter.event,
      open: () => instance.insertTerminalHeader(),
      close: () => {
        instance.terminal = null
      },
      handleInput: instance.handleInputData.bind(instance)
    }
    vscode.window
      .createTerminal({ name: "oe-zext Terminal", pty: instance.terminal })
      .show()
  }

  handleInputData(data) {
    if (data === "\r") {
      if (this.lineCommand.length > 0) {
        this.insertNewLine()
        this.processCommandLine(this.lineCommand)
      }
      this.insertNewCommandInput()
      this.lineCommand = ""
    } else if (data == String.fromCharCode(127)) {
      if (this.lineCommand.length > 0) {
        this.lineCommand = this.lineCommand.substring(
          0,
          this.lineCommand.length - 1
        )
        this.writeEmitter.fire("\b \b")
      }
    } else {
      if (/^[\w\d\s\t\?\!\<\>\.\-\+\,\*\@\/\\]{1}$/i.test(data)) {
        this.writeEmitter.fire(data)
        this.lineCommand += data
      }
    }
  }

  processCommandLine(line) {
    let args = line.split(" ")
    let cmd = args.shift().toLowerCase()
    switch (cmd) {
      case this.CMD_HELP:
        this.processHelp()
        break
      // case this.CMD_DEPLOY:
      //     this.processDeploy(args);
      //     break;
      default:
        this.writeColor(this.COLOR_RED)
        this.writeEmitter.fire(
          `Unknown command: ${cmd}. Type 'help' to available commands`
        )
    }
  }

  processHelp() {
    this.writeColor(this.COLOR_CYAN)
    this.writeEmitter.fire("Commands:")

    this.insertNewLine()
    this.writeEmitter.fire("\tcompile - Compile and deploy the .R")
    this.insertNewLine()
    this.writeEmitter.fire("\tdeploy - Deploy the source file")
    this.insertNewLine()
  }

  // private processDeploy(args: string[]) {
  //     if (args.length > 0) {
  //         let filename = args[0];
  //         this.writeColor(this.COLOR_CYAN);
  //         this.writeEmitter.fire(`Deploy ${filename}... #SQN`);
  //     }
  //     else {
  //         this.writeColor(this.COLOR_MAGENTA);
  //         this.writeEmitter.fire('Missing argument. Usage:');
  //         this.insertNewLine();
  //         this.writeEmitter.fire(`\t${this.CMD_DEPLOY} path/filename.ext`);
  //     }
  // }

  insertTerminalHeader() {
    this.writeColor(this.COLOR_GREEN)
    this.writeEmitter.fire("oe-zext Terminal")
    //
    this.insertNewLine()
    this.writeColor(this.COLOR_RED)
    this.writeEmitter.fire("WORK IN PROGRESS...")
    this.insertNewLine()
    //
    this.insertNewCommandInput()
  }

  insertNewLine() {
    this.writeEmitter.fire("\r\n")
  }

  insertNewCommandInput() {
    this.insertNewLine()
    this.writeColor(this.COLOR_WHITE)
    this.writeEmitter.fire("> ")
  }

  write(text) {
    this.writeEmitter.fire(text)
  }

  writeLine(text) {
    this.write(text)
    this.insertNewLine()
  }

  writeColor(value) {
    this.writeEmitter.fire(`\x1b[${value}m`)
  }
}
