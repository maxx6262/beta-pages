// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./HopeNobt.sol";


contract Distributor is Ownable {
    struct PoolInfo {
        IERC20 token;
        uint256 claimAmt;
    }

    struct ClaimInfo {
        bool claimed;
        uint256 claimedAmt;
    }

    uint256 maxReward;
    uint256 claimedAmount;
    uint256 rewardEndBlock;
    uint256 inviteReward;
    HopeNobt internal hNOBT;
    PoolInfo[] internal pool;
    mapping(address => bool) internal isClaimed;

    constructor(
        HopeNobt _hNOBT
    ) public {
        hNOBT = _hNOBT;
        maxReward = 10000000 * (10 ** uint256(_hNOBT.decimals()));
        inviteReward = 100 * (10 ** uint256(_hNOBT.decimals()));
    }

    function add(IERC20 _token, uint256 _claimAmt) public onlyOwner {
        pool.push(PoolInfo({
        token : _token,
        claimAmt : _claimAmt
        }));
    }

    function update(uint256 _pid, uint256 _claimAmt) public onlyOwner {
        pool[_pid].claimAmt = _claimAmt;
    }

    function setEnd(uint256 _rewardEndBlock) public onlyOwner {
        rewardEndBlock = _rewardEndBlock;
        hNOBT.setEnd(_rewardEndBlock);
    }

    function check() public view returns (bool, uint256){
        if (isClaimed[msg.sender]) {
            return (false, 0);
        }
        for (uint256 pid = 0; pid < pool.length; pid++) {
            uint256 bal = pool[pid].token.balanceOf(msg.sender);
            if (bal > 0) {
                return (true, pid);
            }
        }
        return (false, 0);
    }

    function claim(address inviter) public {
        require(claimedAmount < maxReward, 'NOBT: No ration left, mate!');
        require(rewardEndBlock == 0 || (rewardEndBlock > 0 && block.number < rewardEndBlock), 'NOBT: You missed out, mate!');
        (bool isPass, uint256 pid) = check();
        require(isPass, 'NOBT: Leave it to those in need, mate!');

        uint256 _claimReward = pool[pid].claimAmt;
        if (inviter != msg.sender && inviter != address(0)) {
            isClaimed[msg.sender] = true;
            sendReward(inviter, inviteReward);
            _claimReward += inviteReward;
            hNOBT.addReferral(inviter, msg.sender);
        }
    }

    function sendReward(address _addr, uint256 _rewardAmt) internal {
        uint256 remainReward = maxReward - claimedAmount;
        uint256 _reward = _rewardAmt <= remainReward ? _rewardAmt : remainReward;
        claimedAmount += _reward;
        hNOBT.mint(_addr, _reward);

    }
}