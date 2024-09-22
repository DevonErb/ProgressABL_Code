//check this one
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;

//var fs = require("fs");
const { fs } = require('fs');
//var path = require("path");
const { path } = require('path');
//var cp = require("child_process");
const { cp } = require('child_process');
//var environment_1 = require("./environment");
const { environment_1 } = require('./environment');

var Process = /** @class */ (function () {
  function Process() {}
  Process.xcode = function (workspace, filename) {
    var baseName = path.basename(filename);
    var tmpDir = workspace.uri.fsPath;
    // temp xcode dir
    tmpDir = [
      tmpDir,
      ".xc" + Math.floor(Math.random() * 100000).toString(),
    ].join("\\");
    // temp xcode output
    var outDir = [tmpDir, "out"].join("\\");
    // mkdir (outDir is inside tmpDir)
    Process.mkdir(outDir);
    // copy file to temp dir
    var oldFilename = [workspace.uri.fsPath, baseName].join("\\");
    var newFilename = [tmpDir, baseName].join("\\");
    fs.copyFileSync(oldFilename, newFilename);
    // exec xcode
    var cwd = path.dirname(newFilename);
    var cmd = environment_1.AblEnvironment.getInstance().xcodeBin;
    var args = ["-d", outDir, baseName];
    return new Promise(function (resolve) {
      cp.execFile(cmd, args, { cwd: cwd }, function (err, stdout, stderr) {
        // copy xcoded file to overwrite original file
        fs.copyFileSync([outDir, baseName].join("\\"), oldFilename);
        // remove files/dorectories
        fs.unlinkSync([outDir, baseName].join("\\"));
        fs.unlinkSync(newFilename);
        fs.rmdirSync(outDir);
        fs.rmdirSync(tmpDir);
        //
        if (err) resolve(false);
        else resolve(true);
      });
    });
  };
  Process.mkdir = function (path) {
    var dirs = path.split("\\");
    var _loop_1 = function (i) {
      var dir = dirs
        .filter(function (v, idx) {
          return idx <= i;
        })
        .join("\\");
      if (dir.replace("\\", "") == "") return "continue";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    };
    for (var i = 0; i < dirs.length; i++) {
      _loop_1(i);
    }
  };
  return Process;
})();
exports.Process = Process;
