const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const POINT_ONE_ETH = 100_000_000_000_000_000n;

module.exports = buildModule("RNG_Game_Module", (m) => {
  const initialBalance = m.getParameter("initialBalance", POINT_ONE_ETH);

  // const RNG_game = m.contract("RNG_game", {
  //   value: initialBalance,
  // });
  
  const RNG_game = m.contract("RNG_game");

  return { RNG_game };
});
