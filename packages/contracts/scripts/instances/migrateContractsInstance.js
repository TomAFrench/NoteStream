import path from "path";
import instance from "../utils/instance";
import { errorLog } from "../utils/log";
import { locatePackage, locateFile } from "../utils/path";

const truffleExec = ".bin/truffle";
const truffleConfigFilename = "truffle-config.js";

export default function migrateContractsInstance({
  packageName,
  network = "development",
  onError,
  onClose,
}) {
  const targetPath = locatePackage(packageName);
  if (!targetPath) {
    errorLog(
      `Unable to run truffle migrate. Package '${packageName}' not found.`
    );
    if (onError) {
      onError();
    }
  }

  const trufflePath = locateFile(truffleExec);
  if (!trufflePath) {
    errorLog("Truffle not found", `path: ${trufflePath}`);
    if (onError) {
      onError();
    }
  }

  const truffleConfigPath = path.resolve(
    __dirname,
    `../../${truffleConfigFilename}`
  );
  const migrationsContractPath = path.resolve(
    __dirname,
    "../../contracts/Migrations.sol"
  );
  const migrationsPath = path.resolve(__dirname, "../../migrations");

  const commands = [
    `ln -sfn ${truffleConfigPath} ${targetPath}/${truffleConfigFilename}`,
    `ln -sfn ${migrationsContractPath} ${targetPath}/contracts/Migrations.sol`,
    `ln -sfn ${migrationsPath} ${targetPath}/migrations`,
    `cd ${targetPath}`,
    `${trufflePath} migrate --to 15 --reset --network ${network}`,
    `${trufflePath} migrate --f 16 --network ${network}`,
  ];

  return instance(commands.join(" && "), {
    onError,
    onClose,
  });
}
