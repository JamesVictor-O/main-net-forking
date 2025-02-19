import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  let AmtADesired = ethers.parseUnits("100000", 6);
  let AmtBDesired = ethers.parseUnits("100000", 18);

  let AmtAMin = ethers.parseUnits("99000", 6);
  let AmtBMin = ethers.parseUnits("99000", 18);

  let deadline = (await helpers.time.latest()) + 3000;

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  let usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
  let daiContract = await ethers.getContractAt("IERC20", DAIAddress);
  let uniswapContract = await ethers.getContractAt(
    "IUniswapV2Router02",
    UNIRouter
  );

  const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal BA:",
    ethers.formatUnits(usdcBal, 6)
  );

  console.log("impersonneted acct dai bal BA:", ethers.formatUnits(daiBal, 18));

  await usdcContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, AmtADesired);
  await daiContract.connect(impersonatedSigner).approve(UNIRouter, AmtBDesired);

  console.log("-------------------------- Adding liquidity -------------");

  await uniswapContract
    .connect(impersonatedSigner)
    .addLiquidity(
      USDCAddress,
      DAIAddress,
      AmtADesired,
      AmtBDesired,
      AmtAMin,
      AmtBMin,
      impersonatedSigner.address,
      deadline
    );

  console.log("-------------------------- liquidity added -------------");

  const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal AF:",
    ethers.formatUnits(usdcBalAfter, 6)
  );

  console.log(
    "impersonneted acct dai bal AF:",
    ethers.formatUnits(daiBalAfter, 18)
  );

  console.log("-------------------------- liquidity added  Eth-------------");
  const balanceOfWale = await ethers.provider.getBalance(
    theAddressIFoundWithUSDCAndDAI
  );
  console.log(balanceOfWale, "balance of wale");

  // Correct decimals
  let AmtTokenDes = ethers.parseUnits("1", 6); // USDC (6 decimals)
  let AmtTokenMin = ethers.parseUnits("1", 6); // Adjusted slippage for USDC
  let AmtEthMin = ethers.parseUnits("0.5", 18);
  await uniswapContract
    .connect(impersonatedSigner)
    .addLiquidityETH(
      USDCAddress,
      AmtTokenDes,
      AmtTokenMin,
      3,
      impersonatedSigner.address,
      deadline
    );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
