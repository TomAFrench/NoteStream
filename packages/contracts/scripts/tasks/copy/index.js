import pipeTasks from "../../utils/pipeTasks";
import copyContracts from "./copyContracts";

export default async function copy({ onError, onClose } = {}) {
  return pipeTasks([copyContracts], {
    onError,
    onClose,
  });
}
