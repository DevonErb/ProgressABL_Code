const { path } = require('path');
const { fs } = require('fs');
const { ExtensionConfig } = require('../extension-config');

 class AblEnvironment {
  static getInstance() {
    return new AblEnvironment();
  }

  get dlcPath() {
    let path = ExtensionConfig.getInstance().getConfig()?.dlcPath;
    return path ? path : process.env["DLC"];
  }

  get binPath() {
    return path.join(this.dlcPath, "bin");
  }

  getBinaryPath(name) {
    return path.join(this.binPath, name);
  }

  get progressBin() {
    return this.getBinaryPath("_progres");
  }

  get xcodeBin() {
    return this.getBinaryPath("xcode.exe");
  }

  get prowinBin() {
    let prowin = this.getBinaryPath("prowin.exe");
    if (!fs.existsSync(prowin)) prowin = this.getBinaryPath("prowin32.exe");
    return prowin;
  }

  static createProArgs(options) {
    let pfArgs = [];
    if (options.parameterFiles) {
      // pfArgs = oe_zextConfig.parameterFiles.filter(pf => pf.trim().length > 0).map(pf => { return '-pf ' + pf; });
      pfArgs = options.parameterFiles
        .filter((pf) => pf.trim().length > 0)
        .reduce((r, a) => r.concat("-pf", a), []);
      for (let i = 0; i < pfArgs.length; i++) {
        pfArgs[i] = pfArgs[i].replace(
          "${workspaceRoot}",
          options.workspaceRoot
        );
      }
    }
    let args = [
      "-T", // Redirect temp
    ];
    if (options.temporaryDirectory) {
      args.push(options.temporaryDirectory);
    } else {
      args.push(process.env["TEMP"]);
    }
    args = args.concat(pfArgs);
    if (options.batchMode) {
      args.push("-b");
    }
    if (options.configFile) {
      args.push("-basekey", "ini", "-ininame", options.configFile);
    }
    if (options.startupProcedure) {
      args.push("-p", options.startupProcedure);
    }
    if (options.param) {
      args.push("-param", options.param);
    }

    return args;
  }

  static setupEnvironmentVariables(env, oe_zextConfig, workspaceRoot) {
    if (oe_zextConfig) {
      if (
        !oe_zextConfig.proPath ||
        !(oe_zextConfig.proPath instanceof Array) ||
        oe_zextConfig.proPath.length === 0
      ) {
        oe_zextConfig.proPath = ["${workspaceRoot}"];
      }
      oe_zextConfig.proPath.push(
        path.join(ExtensionConfig.getInstance().getExtensionPath(), "abl-src")
      );
      let paths = oe_zextConfig.proPath.map((p) => {
        p = p.replace("${workspaceRoot}", workspaceRoot);
        p = p.replace("${workspaceFolder}", workspaceRoot);
        p = path.posix.normalize(p);
        return p;
      });
      // let paths = oe_zextConfig.proPath || [];
      env.VSABL_PROPATH = paths.join(",");

      if (oe_zextConfig.proPathMode) {
        env.VSABL_PROPATH_MODE = oe_zextConfig.proPathMode;
      } else {
        env.VSABL_PROPATH_MODE = "append";
      }
    }
    env.VSABL_SRC = path.join(
      ExtensionConfig.getInstance().getExtensionPath(),
      "abl-src"
    );
    env.VSABL_WORKSPACE = workspaceRoot;
    return env;
  }

  static expandPathVariables(path, env, variables) {
    // format VSCode ${env:VAR}
    // path = path.replace(/\${env:([^}]+)}/g, (_, n) => {
    //     return env[n];
    // });

    // format DOS %VAR%
    path = path.replace(/%([^%]+)%/g, (_, n) => {
      return env[n];
    });

    // VSCode specific var ${workspaceFolder}
    path = path.replace(/\${([^}]+)}/g, (_, n) => {
      return variables[n];
    });
    return path;
  }
}

module.exports = AblEnvironment;