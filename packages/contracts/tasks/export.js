const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
// const bre = require('@nomiclabs/buidler');

const publishDir = path.resolve(
    __dirname,
    '../../contract-artifacts/contracts/'
);

async function exportContracts(bre) {
    const contractDir = bre.config.paths.sources;
    const artifactsDir = bre.config.paths.artifacts;
    if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir);
    }
    const finalContractList = [];
    fs.readdirSync(contractDir).forEach((file) => {
        if (file.indexOf('.sol') >= 0) {
            const contractName = file.replace('.sol', '');
            console.log(
                'Publishing',
                chalk.cyan(contractName),
                'to',
                chalk.yellow(publishDir)
            );
            try {
                const contract = fs
                    .readFileSync(
                        path.resolve(artifactsDir, `${contractName}.json`)
                    )
                    .toString();
                fs.writeFileSync(
                    `${publishDir}/${contractName}.ts`,
                    `export default ${contract}`
                );
                finalContractList.push(contractName);
            } catch (e) {
                console.log(e);
            }
        }
    });
    fs.writeFileSync(
        `${publishDir}/contracts.ts`,
        `export default ${JSON.stringify(finalContractList)}`
    );
}

module.exports = { exportContracts };
