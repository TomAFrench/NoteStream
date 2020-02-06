import detectPort from 'detect-port';
import chalk from 'chalk';
import {
  warnLog,
  errorLog,
  log,
} from '../utils/log';
import {
  argv,
} from '../utils/cmd';
import {
  getPort,
} from '../instances/ganacheInstance';
import setup from './setup';

export default function start({
  onError,
  onClose,
} = {}) {
  const ganachePort = getPort();

  const handleError = (error) => {
    if (error) {
      errorLog('Something went wrong', error);
    }
    if (onError) {
      onError(error);
    } else if (onClose) {
      onClose();
    }
  };

  const showHints = () => {
    log('\n');
    log('\n');
    log('  To see demo, run the following in another terminal window:\n');
    log(`    ${chalk.cyan('http-server -p 3000')}               - run it in ${chalk.yellow('/demo')}.`);
    log('\n');
    log('  Other available commands:\n');
    log(`    ${chalk.cyan('yarn deploy:contracts')}             - migrate contracts and copy artifacts.`);
    log(`    ${chalk.cyan('yarn lint')}                         - run eslint on all files.`);
    log('\n');
    log(`  Press ${chalk.yellow('h')} to show the above hints again.`);
    log('\n');
    log('\n');
  };

  const handleStart = () => {
    log('\n');
    log('\n');
    log(`${chalk.green('✔')} Contracts were deployed, artifacts were copied, birds are chirping, everything is perfect!`);
    log('  Next, you can...');
    showHints();
  };

  detectPort(ganachePort, (error, _port) => {
    if (error) {
      if (onError) {
        onError(error);
      }
      return;
    }

    if (_port !== ganachePort) {
      if (!argv('useExistingGanache')) {
        warnLog(`There is already a process running on port ${ganachePort}`);
        log(`Stop that instance or run ${chalk.cyan('yarn start --useExistingGanache')} to use the same ganache instance.'`);

        if (onClose) {
          onClose();
        } else {
          setTimeout(() => {
            process.exit(0);
          }, 100);
        }
      }
      return;
    }

    setup({
      onStart: handleStart,
      onError: handleError,
      onClose,
      showHints,
    });
  });
}
