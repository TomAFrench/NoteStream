import pipeTasks from "../utils/pipeTasks";
import migrateProtocol from "./migrateProtocol";
import copyContracts from "./copy/copyContracts";

export default function deployContracts({ onError, onClose } = {}) {
  pipeTasks([migrateProtocol, copyContracts], {
    onError,
    onClose,
  });
}
