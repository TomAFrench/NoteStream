import detectPort from "detect-port";
import chalk from "chalk";
import { warnLog, errorLog, log } from "../utils/log";
import { argv } from "../utils/cmd";
import { getPort } from "../instances/ganacheInstance";
import setup from "./setup";

export default function start({ onError, onClose } = {}) {
  const ganachePort = getPort();

  const handleError = (error) => {
    if (error) {
      errorLog("Something went wrong", error);
    }
    if (onError) {
      onError(error);
    } else if (onClose) {
      onClose();
    }
  };

  const showHints = () => {
    log("\n");
    log("\n");
    log("  To see demo dapp, run the following in another terminal window:\n");
    log(
      `    ${chalk.cyan(
        "yarn demo"
      )}                         - simple usage of the sdk written in pure html and js.`
    );
    log("\n");
    log("  Other available commands:\n");
    log(
      `    ${chalk.cyan("yarn start:ganache")}                - start ganache.`
    );
    log(
      `    ${chalk.cyan(
        "yarn deploy:contracts"
      )}             - migrate contracts and copy artifacts.`
    );
    log("\n");

    log("  Deployed contracts:\n");
    ["ACE", "AccountRegistryManager"].forEach((contractName) => {
      let contract;
      let address = "";
      let color = "magenta";
      try {
        contract = require(`../../build/contracts/${contractName}.json`); // eslint-disable-line
        const lastNetworkId = Object.keys(contract.networks).pop();
        const network = contract.networks[lastNetworkId];
        address = (network && network.address) || "null";
        if (!address) {
          color = "dim";
        }
      } catch (error) {
        address = "not found";
        color = "red";
      }

      log(
        `    ${contractName}${"".padEnd(
          34 - contractName.length,
          " "
        )}- ${chalk[color](address)}`
      );
    });
    log("\n");

    log(`  Press ${chalk.yellow("h")} to show the above hints again.`);
    log("\n");
    log("\n");
  };

  const handleStart = () => {
    log("\n");
    log("\n");
    log(
      `${chalk.green(
        "✔"
      )} Contracts were deployed, artifacts were copied, birds are chirping, everything is perfect!`
    );
    log("  Next, you can...");
    showHints();
  };

  detectPort(ganachePort, (error, _port) => {
    if (error) {
      if (onError) {
        onError(error);
      }
      return;
    }

    const useExistingGanache = _port !== ganachePort;
    if (useExistingGanache && !argv("useExistingGanache")) {
      log("\n");
      warnLog(`There is already a process running on port ${ganachePort}\n`);
      log(
        `Stop that process or run ${chalk.cyan(
          "yarn start --useExistingGanache"
        )} to use the same ganache instance.\n`
      );
      log(
        `If there is no GSN relayer running in that ganache, add ${chalk.cyan(
          "--runRelayer"
        )} to start a relayer.`
      );
      log("\n");

      if (onClose) {
        onClose();
      } else {
        setTimeout(() => {
          process.exit(0);
        }, 100);
      }

      return;
    }

    setup({
      onStart: handleStart,
      onError: handleError,
      onClose,
      showHints,
      useExistingGanache,
    });
  });
}
