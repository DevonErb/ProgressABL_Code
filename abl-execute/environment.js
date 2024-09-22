const { path } = require('path');
const { fs } = require('fs');
const { ExtensionConfig } = require('../extension-config');

export class AblEnvironment {
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

  createProArgs(options) {
    let pfArgs = [];
    if (options.parameterFiles) {
      // pfArgs = oe-zextConfig.parameterFiles.filter(pf => pf.trim().length > 0).map(pf => { return '-pf ' + pf; });
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

  setupEnvironmentVariables(env, oe-zextConfig, workspaceRoot) {
    if (oe-zextConfig) {
      if (
        !oe-zextConfig.proPath ||
        !(oe-zextConfig.proPath instanceof Array) ||
        oe-zextConfig.proPath.length === 0
      ) {
        oe-zextConfig.proPath = ["${workspaceRoot}"];
      }
      oe-zextConfig.proPath.push(
        path.join(ExtensionConfig.getInstance().getExtensionPath(), "abl-src")
      );
      let paths = oe-zextConfig.proPath.map((p) => {
        p = p.replace("${workspaceRoot}", workspaceRoot);
        p = p.replace("${workspaceFolder}", workspaceRoot);
        p = path.posix.normalize(p);
        return p;
      });
      // let paths = oe-zextConfig.proPath || [];
      env.VSABL_PROPATH = paths.join(",");

      if (oe-zextConfig.proPathMode) {
        env.VSABL_PROPATH_MODE = oe-zextConfig.proPathMode;
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

  expandPathVariables(path, env, variables) {
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
