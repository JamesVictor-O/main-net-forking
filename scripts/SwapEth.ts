import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const amountOut = ethers.parseUnits("2000", 6);
    const amountIn = ethers.parseEther("1");

    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    const wethContract = await ethers.getContractAt("IERC20", WETHAddress);

    const uniswapContract = await ethers.getContractAt("IUniswapV2Router02", UNIRouter);

    const approveTx = await usdcContract.connect(impersonatedSigner).approve(UNIRouter, amountOut);
    await approveTx.wait();

    const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
    const wethBal = await wethContract.balanceOf(impersonatedSigner.address);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
    console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const swapTx = await uniswapContract.connect(impersonatedSigner).swapExactTokensForTokens(
        amountOut,
        0, 
        [USDCAddress, DAIAddress],
        impersonatedSigner.address,
        deadline
    );

    await swapTx.wait();

    const usdcBalAfterSwap = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfterSwap = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("-----------------------------------------------------------------");
    console.log("USDC Balance After Swap:", ethers.formatUnits(usdcBalAfterSwap, 6));
    console.log("DAI Balance After Swap:", ethers.formatUnits(daiBalAfterSwap, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});