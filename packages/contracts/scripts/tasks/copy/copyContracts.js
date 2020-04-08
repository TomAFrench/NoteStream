import path from "path";
import { successLog, errorLog, logEntries } from "../../utils/log";
import { projectRoot, locatePackage } from "../../utils/path";
import { ensureDirectory, isDirectory } from "../../utils/fs";
import instance from "../../utils/instance";

const sourcePackage = "protocol";
const folderName = "contracts";
const sourceFolder = "build";
const destFolders = ["build", "demo/build", "my-dapp/build"];

export default function copyContracts({ onError, onClose } = {}) {
  const packagePath = locatePackage(sourcePackage);
  if (!packagePath) {
    errorLog(`Cannot locate package "${sourcePackage}".`);
    onError();
    return;
  }

  const contractsPath = path.join(packagePath, `${sourceFolder}/${folderName}`);
  if (!isDirectory(contractsPath)) {
    errorLog("Cannot find source contracts", contractsPath);
    onError();
    return;
  }

  const commands = [];
  destFolders.forEach((destFolder) => {
    const destPath = path.join(projectRoot, destFolder);
    ensureDirectory(destPath);
    commands.push(`cp -r ${contractsPath} ${destPath}`);
  });

  instance(commands.join(" && "), {
    onError,
    onClose: () => {
      successLog("\nSuccessfully copied contracts!\n");
      destFolders.forEach((destFolder) => {
        logEntries([`${sourcePackage} > ${destFolder}/${folderName}`]);
      });
      onClose();
    },
  });
}
