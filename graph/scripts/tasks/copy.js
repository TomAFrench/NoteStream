import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import graphNodeConfig from '../../config/graphNode';
import {
    safeReadFileSync,
    ensureDirectory,
    copyFolder,
    isDirectory,
    isFile,
} from '../utils/fs';
import {
    manifestPath,
    projectRoot,
    locateModule,
    locatePackage,
} from '../utils/path';
import {
    logEntries,
    successLog,
    errorLog,
    log,
} from '../utils/log';

const {
    manifest: manifestFilename,
} = graphNodeConfig;

const root = path.resolve(__dirname, '../../');

const graphProtocolModule = '@graphprotocol';

const destBuildFolder = 'build';
const destAbisFolder = 'abis';
const destContractsFolder = 'contracts';

const srcContractsFolder = 'build/contracts';

const getManifestYaml = () => {
    let config = null;
    try {
        config = yaml.safeLoad(safeReadFileSync(manifestPath));
    } catch (error) {
        errorLog(`Failed to load ${manifestFilename}.`, error.message);
    }

    return config;
};

const retrieveAbis = dataSources =>
    dataSources.reduce((arr, cur) => [
        ...arr,
        ...((cur.mapping && cur.mapping.abis) || []),
        ...((cur.templates && retrieveAbis(cur.templates)) || []),
    ], []);

const retrieveAddresses = (dataSources) => {
    const addresses = [];
    dataSources.forEach((dataSource) => {
        const {
            name,
            source: {
                address,
            } = {},
        } = dataSource;
        if (!name) {
            errorLog('Source name is not defined.');
            return;
        }
        if (!address) {
            errorLog('Contract address is not defined');
            return;
        }
        addresses.push({
            name,
            address,
        });
    });

    return addresses;
};

const copyAbi = (contractName, srcFolderPath, destFilePath) =>
    new Promise((resolve, reject) => {
        let abi;
        const requirePath = path.join(srcFolderPath, `${contractName}.json`);
        if (!requirePath) {
            errorLog(`Cannot find contract '${contractName}'.`);
            reject();
            return;
        }
        try {
            const contract = require(requirePath); // eslint-disable-line
            ({ abi } = contract || {});
        } catch (error) {
            errorLog('Cannot require contract', `path: ${requirePath}`);
            reject();
            return;
        }
        if (!abi) {
            errorLog(`Abi is not defined in contract '${contractName}'`);
            reject();
            return;
        }

        fs.writeFile(destFilePath, JSON.stringify(abi), (error) => {
            if (error) {
                errorLog('Failed to create abi file', `${destFilePath}`, error);
            }
            resolve({
                src: requirePath,
                dest: destFilePath,
                error,
            });
        });
    });

const copyContractAddresses = (prevAddresses, srcFolderPath) =>
    new Promise((resolve) => {
        const originalConfig = safeReadFileSync(manifestPath);
        let newConfig = originalConfig;
        prevAddresses.forEach(({
            name,
            address,
        }) => {
            const filename = path.join(srcFolderPath, `${name}.json`);
            if (!isFile(filename)) {
                errorLog(`Cannot find file ${name}.json`);
                return;
            }
            const contract = require(path.relative( // eslint-disable-line global-require
                __dirname,
                filename,
            ));
            const {
                networks,
            } = contract || {};
            if (!networks) {
                errorLog(`No networks defined for contract ${name}`);
                return;
            }
            const networkConfigs = Object.values(networks);
            const {
                address: newAddress,
            } = networkConfigs[networkConfigs.length - 1] || {};
            if (!newAddress) {
                errorLog(`No address defined for contract ${name}`);
                return;
            }
            const pattern = new RegExp(`(address:)(\\s)+'(${address})'`);
            newConfig = newConfig.replace(pattern, `$1 '${newAddress}'`);
        });

        fs.writeFile(manifestPath, newConfig, (error) => {
            if (error) {
                errorLog(`Cannot white to file ${manifestFilename}`);
            }
            resolve({
                src: `Contract address${prevAddresses.length === 1 ? '' : 'es'}`,
                dest: manifestFilename,
                error,
            });
        });
    });

export default async function copy({
    onError,
    onClose,
} = {}) {
    const srcContractsPath = path.join(root, srcContractsFolder);
    if (!isDirectory(srcContractsPath)) {
        log('Please run `yarn build` to get contract artifacts.');
        if (onError) {
            onError();
        }
        return;
    }

    const promises = [];

    const manifestYaml = getManifestYaml();
    if (!manifestYaml) {
        if (onError) {
            onError();
        }
        return;
    }
    const {
        dataSources,
    } = manifestYaml;
    if (!dataSources) {
        errorLog(`There is no dataSources defined in ${manifestFilename}`);
        if (onError) {
            onError();
        }
        return;
    }

    const addresses = retrieveAddresses(dataSources);
    if (addresses.length) {
        promises.push(copyContractAddresses(
            addresses,
            srcContractsPath,
        ));
    }

    const abis = retrieveAbis(dataSources);
    if (abis.length) {
        ensureDirectory(path.join(projectRoot, destBuildFolder, destAbisFolder));

        abis.forEach(({
            name,
            file,
        }) => {
            promises.push(copyAbi(
                name,
                srcContractsPath,
                file,
            ));
        });
    }
    promises.push(copyFolder(srcContractsPath, path.join(root,'../src/src/build')));

    const result = await Promise.all(promises);
    const copiedMessages = [];
    let successCopies = 0;
    result.forEach(({
        error,
        src,
        dest,
    }) => {
        if (error) {
            copiedMessages.push(`${chalk.red('✖')} ${src} ➔  ${dest}`);
        } else {
            successCopies += 1;
            copiedMessages.push(`  ${src} ➔  ${dest}`);
        }
    });

    logEntries(copiedMessages);
    successLog(`${successCopies} files/folders copied.`);

    if (onClose) {
        onClose();
    }
}
