import detectPort from "detect-port";
import { terminal } from "terminal-kit";
import chalk from "chalk";
import { warnLog, log } from "../utils/log";
import instance from "../utils/instance";

export default function startDemo({ onError, onClose } = {}) {
  const defaultPort = 3000;

  const handleStart = (port) => {
    log("\n");
    log("Starting up http-server, serving ./demo");
    log("Demo dapp is running on:\n");
    log(`    ${chalk.cyan(`http://localhost:${port}`)}`);
    log("\n");
  };

  const doStartDemo = (port) =>
    instance(`cd demo && http-server -p ${port}`, {
      onReceiveOutput: () => {},
      onReceiveErrorOutput: () => {},
      shouldStart: (output) =>
        output.includes("Available on") && handleStart(port),
      onError,
      onClose,
    });

  detectPort(defaultPort, (error, _port) => {
    if (error) {
      if (onError) {
        onError(error);
      }
      return;
    }

    if (_port !== defaultPort) {
      log("\n");
      warnLog(`There is already a process running on port ${defaultPort}\n`);
      log(`Would you like to run the demo on port ${_port} instead? (y/n)`);

      terminal.grabInput(true);
      terminal.on("key", (key) => {
        switch (key) {
          case "CTRL_C":
          case "n":
          case "N": {
            onClose();
            break;
          }
          case "ENTER":
          case "y":
          case "Y":
            terminal.grabInput(false);
            doStartDemo(_port);
            break;
          default:
        }
      });

      return;
    }

    doStartDemo(_port);
  });
}
