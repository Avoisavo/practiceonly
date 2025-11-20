// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract SimpleAMM {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint112 public reserveA; // token A reserve
    uint112 public reserveB; // token B reserve

    // very simple LP share system
    uint256 public totalLPSupply;
    mapping(address => uint256) public lpBalance;

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ----------- INTERNAL HELPERS -----------

    function _updateReserves() internal {
        reserveA = uint112(tokenA.balanceOf(address(this)));
        reserveB = uint112(tokenB.balanceOf(address(this)));
    }

    function getK() public view returns (uint256) {
        return uint256(reserveA) * uint256(reserveB);
    }

    // price of 1 A in terms of B
    function getPriceAinB() external view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "No reserves");
        return (uint256(reserveB) * 1e18) / uint256(reserveA);
    }

    // price of 1 B in terms of A
    function getPriceBinA() external view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "No reserves");
        return (uint256(reserveA) * 1e18) / uint256(reserveB);
    }

    // ----------- LIQUIDITY FUNCTIONS -----------

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Zero amount");

        // transfer tokens in
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "A transfer failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "B transfer failed");

        // update reserves
        _updateReserves();

        uint256 liquidity;
        if (totalLPSupply == 0) {
            // first LP: simple LP mint rule
            liquidity = sqrt(amountA * amountB);
        } else {
            // later LPs: keep ratios
            liquidity = min(
                (amountA * totalLPSupply) / (reserveA - uint112(amountA)),
                (amountB * totalLPSupply) / (reserveB - uint112(amountB))
            );
        }

        require(liquidity > 0, "No liquidity minted");
        lpBalance[msg.sender] += liquidity;
        totalLPSupply += liquidity;
    }

    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0, "Zero LP");
        require(lpBalance[msg.sender] >= lpAmount, "Not enough LP");

        uint256 share = (lpAmount * 1e18) / totalLPSupply;

        uint256 amountA = (uint256(reserveA) * share) / 1e18;
        uint256 amountB = (uint256(reserveB) * share) / 1e18;

        lpBalance[msg.sender] -= lpAmount;
        totalLPSupply -= lpAmount;

        // transfer tokens out
        require(tokenA.transfer(msg.sender, amountA), "A transfer failed");
        require(tokenB.transfer(msg.sender, amountB), "B transfer failed");

        _updateReserves();
    }

    // ----------- SWAP FUNCTIONS -----------

    // swap exact A for B (no fee, no slippage protection)
    function swapAforB(uint256 amountIn) external {
        require(amountIn > 0, "Zero input");
        require(tokenA.transferFrom(msg.sender, address(this), amountIn), "A transfer failed");

        uint256 x = tokenA.balanceOf(address(this));
        uint256 y = tokenB.balanceOf(address(this));

        // x' = x, y' such that x'*y' = k
        uint256 k = (x - amountIn) * y; // previous k

        uint256 newY = k / x;
        uint256 amountOut = y - newY;

        require(amountOut > 0, "Zero output");
        require(tokenB.transfer(msg.sender, amountOut), "B transfer failed");

        _updateReserves();
    }

    // swap exact B for A (symmetric)
    function swapBforA(uint256 amountIn) external {
        require(amountIn > 0, "Zero input");
        require(tokenB.transferFrom(msg.sender, address(this), amountIn), "B transfer failed");

        uint256 x = tokenA.balanceOf(address(this));
        uint256 y = tokenB.balanceOf(address(this));

        uint256 k = x * (y - amountIn); // previous k

        uint256 newX = k / y;
        uint256 amountOut = x - newX;

        require(amountOut > 0, "Zero output");
        require(tokenA.transfer(msg.sender, amountOut), "A transfer failed");

        _updateReserves();
    }

    // ----------- MATH UTILS -----------

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
