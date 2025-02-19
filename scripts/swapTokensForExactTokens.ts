import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  const amountOut = ethers.parseUnits("10", 6);
  let deadline = (await helpers.time.latest()) + 500;

  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);

  const uniswapContract = await ethers.getContractAt(
    "IUniswapV2Router02",
    UNIRouter
  );

  await USDC.connect(impersonatedSigner).approve(UNIRouter, amountOut);

  const USDCBal = await USDC.balanceOf(impersonatedSigner.address);
  const DAIBal = await DAI.balanceOf(impersonatedSigner.address);
  console.log("USDC Balance Before Swap:", ethers.formatUnits(USDCBal, 6));
  console.log("DAI Balance Before Swap:", ethers.formatUnits(DAIBal, 18));

  console.log("-------------------------- Swapping -------------");

  await uniswapContract
    .connect(impersonatedSigner)
    .swapTokensForExactTokens(
      amountOut,
      100000,
      [USDCAddress, DAIAddress],
      impersonatedSigner.address,
      deadline
    );

  console.log("-------------------------- Swapped -------------");

  const USDCBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const DAIBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);
  console.log(
    "USDC Balance After Swap:",
    ethers.formatUnits(USDCBalAfterSwap, 6)
  );
  console.log(
    "DAI Balance After Swap:",
    ethers.formatUnits(DAIBalAfterSwap, 18)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});