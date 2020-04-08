import { terminal } from "terminal-kit";
import { log, successLog, warnLog } from "./log";
import stopProcesses from "./stopProcesses";

export default class GracefulKiller {
  constructor() {
    this.runningProcesses = {};
    this.confirmClose = false;
    this.enable();
  }

  addProcess(name, proccess) {
    this.runningProcesses[name] = proccess;
  }

  async handleClose() {
    this.disable();
    stopProcesses(this.runningProcesses, (name) => {
      this.runningProcesses[name] = null;
    });
  }

  makeCloseChildProcessCallback(name, doClose) {
    return () => {
      if (!(name in this.runningProcesses)) return;

      delete this.runningProcesses[name];
      successLog(`${name} instance stopped.`);

      if (Object.keys(this.runningProcesses).length) {
        this.handleClose();
      } else {
        doClose();
      }
    };
  }

  enable() {
    terminal.grabInput(true);
    terminal.on("key", (key) => {
      switch (key) {
        case "CTRL_C": {
          if (!this.confirmClose) {
            this.confirmClose = true;
            warnLog("\nGracefully stopping child processes...\n");
            log("Press ctrl+c again to force exit.");
            log(
              "(Doing so may cause problems when running the same process again.)\n"
            );
            this.handleClose();
          } else {
            process.exit(0);
          }
          break;
        }
        case "ENTER":
          log("\n");
          break;
        default:
          if (this.confirmClose) {
            this.confirmClose = false;
          }
      }
    });
  }

  disable() {
    // eslint-disable-line class-methods-use-this
    terminal.grabInput(false);
  }
}
