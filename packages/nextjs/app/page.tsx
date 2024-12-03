"use client";

import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home = () => {
  const { address, isConnected } = useAccount();
  const [lotteryStatus, setLotteryStatus] = useState<boolean>(false);
  const [closingTime, setClosingTime] = useState<Date | null>(null);
  const [userTokens, setUserTokens] = useState<any>("0");
  const [prize, setPrize] = useState<string>("0");
  const MAXUINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
  // Read: Check if bets are open
  const { data: betsOpen } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "betsOpen",
  });

  // Read: Get bets closing time
  const { data: betsClosingTime } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "betsClosingTime",
  });

  // Read: User's token balance
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "getBalance",
    args: [address],
  });

  // Read: User's prize balance
  const { data: userPrize } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "prize",
    args: [address],
  });

  // Write: Purchase Tokens
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("Lottery");
  const { writeContractAsync: writeYourContractAsync2 } = useScaffoldWriteContract("LotteryToken");
  // Effect: Update state based on read results
  useEffect(() => {
    if (isConnected) {
      setLotteryStatus(!!betsOpen);
      setClosingTime(betsClosingTime ? new Date(Number(betsClosingTime) * 1000) : null);
      setUserTokens(tokenBalance ? tokenBalance.toString() : "0");
      setPrize(userPrize ? userPrize.toString() : "0");
    }
  }, [betsOpen, betsClosingTime, tokenBalance, userPrize, isConnected, address]);

  return (
    <div className="container mx-auto py-8">
      {/* Wallet Connection */}

      {/* Lottery Info */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Lottery Information</h1>
        <p>
          Status: <strong>{lotteryStatus ? "Open" : "Closed"}</strong>
        </p>
        {closingTime && (
          <p>
            Closing Time: <strong>{closingTime.toLocaleString()}</strong>
          </p>
        )}
        <p>
          Your Tokens: <strong>{userTokens / 10 ** 18}</strong>
        </p>
        <p>
          Your Prize: <strong>{prize} Tokens</strong>
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Actions</h2>
        <button
          className="btn btn-primary mb-2"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: "purchaseTokens",
                args: undefined,
                value: parseEther("0.01"), // Send 1 ETH
              });
            } catch (e) {
              console.error("Error purchasing tokens:", e);
            }
          }}
        >
          Buy 100 Token (0.01 ETH)
        </button>
        <button
          className="btn btn-primary mb-2"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: "betMany",
                args: [10000n], // Number of bets
              });
            } catch (e) {
              console.error("Error placing bet:", e);
            }
          }}
        >
          Place 1 Bet
        </button>
        <button
          className="btn btn-primary mb-2"
          onClick={async () => {
            try {
              await writeYourContractAsync2({
                functionName: "approve",
                args: ["0x489E9642D8df772A942B75669Ae149aC42B10e4D", MAXUINT256],
              });
            } catch (e) {
              console.error("Error APPROVING:", e);
            }
          }}
        >
          Approve
        </button>
        <button
          className="btn btn-primary mb-2"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: "prizeWithdraw",
                args: [BigInt(prize)],
              });
            } catch (e) {
              console.error("Error claiming prize:", e);
            }
          }}
        >
          Claim Prize
        </button>
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: "returnTokens",
                args: [1000000000000000000n], // 1 token in wei
              });
            } catch (e) {
              console.error("Error burning tokens:", e);
            }
          }}
        >
          Burn 1 Token
        </button>
      </div>

      {/* Owner Actions */}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Owner Actions</h2>
        <button
          className="btn btn-secondary mb-2"
          onClick={async () => {
            try {
              const currentTimestamp = Math.floor(Date.now() / 1000); // Get current time in seconds
              const closingTime = currentTimestamp + 3600; // Open for 1 hour (3600 seconds)

              await writeYourContractAsync({
                functionName: "openBets",
                args: [BigInt(closingTime)], // Use the calculated closingTime
              });
            } catch (e) {
              console.error("Error opening bets:", e);
            }
          }}
        >
          Open Bets for 1 Hour
        </button>

        <button
          className="btn btn-secondary"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: "closeLottery",
              });
            } catch (e) {
              console.error("Error closing lottery:", e);
            }
          }}
        >
          Close Lottery
        </button>
      </div>
    </div>
  );
};

export default Home;
