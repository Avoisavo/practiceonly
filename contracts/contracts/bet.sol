// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract bet {
    enum BetStatus { PENDING, ACTIVE, RESOLVED, CANCELLED }
    
    struct Bet {
        address maker;
        address taker;
        address judge;
        uint256 amount;
        string description;
        uint256 deadline;
        BetStatus status;
        address winner;
    }
    
    Bet public bet;
    mapping(address => uint256) public stakes;

    modifier onlyParticipants() {
        require(msg.sender == bet.maker || msg.sender == bet.taker, "Not a participant");
        _;
    }
    
    modifier onlyJudge() {
        require(msg.sender == bet.judge, "Only judge can resolve");
        _;
    }
    
    constructor(Bet memory _bet) payable {
        _bet.maker = msg.sender;
        _bet.amount = msg.value;
        _bet.status = BetStatus.PENDING;
        _bet.winner = address(0);
        bet = _bet;
        stakes[msg.sender] = msg.value;
    }
    
    function acceptBet() external payable {
        require(msg.sender == bet.taker, "Only designated taker can accept");
        require(bet.status == BetStatus.PENDING, "Bet is not pending");
        require(block.timestamp < bet.deadline, "Bet has expired");
        require(msg.value == bet.amount, "Must stake the same amount");
        
        stakes[msg.sender] = msg.value;
        bet.status = BetStatus.ACTIVE;
        
    }
    
    function resolveBet(address _winner) external onlyJudge {
        require(bet.status == BetStatus.ACTIVE, "Bet is not active");
        require(_winner == bet.maker || _winner == bet.taker, "Winner must be a participant");
        
        bet.winner = _winner;
        bet.status = BetStatus.RESOLVED;
        
        uint256 totalAmount = address(this).balance;
        payable(_winner).transfer(totalAmount);
        
    }
    
    function cancelBet() external {
        require(bet.status == BetStatus.PENDING || bet.status == BetStatus.ACTIVE, "Cannot cancel resolved bet");
        
        // Maker can cancel pending bet, anyone can cancel expired bet
        if (bet.status == BetStatus.PENDING) {
            require(msg.sender == bet.maker, "Only maker can cancel pending bet");
        } else {
            require(block.timestamp >= bet.deadline, "Can only cancel expired active bet");
        }
        
        bet.status = BetStatus.CANCELLED;
        
        // Refund stakes
        if (stakes[bet.maker] > 0) {
            uint256 makerStake = stakes[bet.maker];
            stakes[bet.maker] = 0;
            payable(bet.maker).transfer(makerStake);
        }
        
        if (stakes[bet.taker] > 0) {
            uint256 takerStake = stakes[bet.taker];
            stakes[bet.taker] = 0;
            payable(bet.taker).transfer(takerStake);
        }
        
    }
    
    function getBetDetails() external view returns (
        address maker,
        address taker,
        address judge,
        uint256 amount,
        string memory description,
        uint256 deadline,
        BetStatus status,
        address winner
    ) {
        return (
            bet.maker,
            bet.taker,
            bet.judge,
            bet.amount,
            bet.description,
            bet.deadline,
            bet.status,
            bet.winner
        );
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}