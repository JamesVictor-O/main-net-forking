import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    let AmtTokenDes = ethers.parseUnits("1", 6); 
    let AmtTokenMin = ethers.parseUnits("0.9", 6);
    let AmtEthMin = ethers.parseUnits("0.0005", 18); 
  let deadline = (await helpers.time.latest()) + 2000;

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
  const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

  console.log(
    "Impersonated account USDC balance:",
    ethers.formatUnits(usdcBal, 6)
  );
  console.log(
    "Impersonated account DAI balance:",
    ethers.formatUnits(daiBal, 18)
  );
  console.log(
    "Impersonated account ETH balance:",
    ethers.formatUnits(ethBal, 18)
  );

 
  await usdcContract.connect(impersonatedSigner).approve(UNIRouter, AmtTokenDes);
 

  console.log("-------------------------- Adding Liquidity ETH -------------");

  
  const tx = await uniswapContract
    .connect(impersonatedSigner)
    .addLiquidityETH(
      USDCAddress,
      AmtTokenDes,
      AmtTokenMin,
      AmtEthMin,
      impersonatedSigner.address,
      deadline,
      { value: AmtEthMin } 
    );
 
  await tx.wait();
  console.log("Liquidity added successfully!");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});