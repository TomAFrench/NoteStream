import GracefulKiller from "../utils/GracefulKiller";
import ganacheInstance from "../instances/ganacheInstance";

export default function startGanache({ onError, onClose } = {}) {
  const gracefulKiller = new GracefulKiller();
  const ganacheProcess = ganacheInstance({
    onError,
    onClose: gracefulKiller.makeCloseChildProcessCallback("ganache", onClose),
  });
  gracefulKiller.addProcess("ganache", ganacheProcess);

  return ganacheProcess;
}
