const env = require("@nomiclabs/buidler");

async function main() {
  await env.run("compile");

  // We require the artifacts once our contracts are compiled
  const AztecStreamer = env.artifacts.require("AztecStreamer");
  const aztecStreamer = await AztecStreamer.new("0x6f143F72f1214ade68d2edC7aC8fE876C8f86B7C");

  console.log("Aztec address:", aztecStreamer.address, aztecStreamer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
