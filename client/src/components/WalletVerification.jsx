// WalletVerification.js
import React, { useEffect, useState } from "react";
import axios from "axios"; // import axios to make HTTP requests
import logo1 from "../images/dbm.png";

function WalletVerification({ userDetails }) {
  const [tronWeb, setTronWeb] = useState(null);
  const [status, setStatus] = useState(`Please connect your Tronlink Wallet`);
  const [signDisabled, setSignDisabled] = useState(true);
  const [walletVerified, setWalletVerified] = useState(false);

  // Initialize TronWeb
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
        clearInterval(intervalId);
        console.log("TronWeb is ready");
        setStatus(
          "You have logged into your Tronlink Wallet, connect to this Dapp by clicking on Connect Wallet."
        );
      } else {
        console.log("Waiting for TronWeb");
      }
    }, 500);

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  async function connectWallet() {
    if (!tronWeb) {
      setStatus("Waiting for Tronlink...");
      return;
    }

    // If TronWeb is injected, check for the defaultAddress (wallet is connected).
    if (tronWeb.defaultAddress.base58) {
      const connectedWallet = tronWeb.defaultAddress.base58;
      console.log("Connected Wallet Address: ", connectedWallet);

      try {
        // Check if the connected wallet is in the list of wallets in the database
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/check-wallet`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wallet: connectedWallet,
            }),
          }
        );

        const data = await response.json();

        if (data.wallet) {
          setStatus("Connected: " + connectedWallet);
          setSignDisabled(false);
        } else {
          setStatus(
            "Your wallet is not on the allowed list, please connect the wallet you used to participate on the TEAMFUND you are validating."
          );
        }
      } catch (error) {
        console.error("Error checking wallet: ", error);
        setStatus("Error checking wallet");
      }
    } else {
      setStatus("No wallet connected. Open your TronLink wallet.");
    }
  }

  // Sign message and verify signature
  const signMessage = async () => {
    if (!tronWeb) {
      console.log("Waiting for TronWeb");
      return;
    }

    try {
      const message =
        "I am responsible for this wallet and I authorize this wallet to receive payouts from the TEAMFUND.";
      const signature = await tronWeb.trx.signMessageV2(message);

      const verifiedAddress = await tronWeb.trx.verifyMessageV2(
        message,
        signature
      );

      if (verifiedAddress === tronWeb.defaultAddress.base58) {
        setWalletVerified(true);
        setStatus("Signed Message: " + message + "\n" + "Message Verified");
        await axios.post(process.env.REACT_APP_SERVER_URL + "/verify-wallet", {
          wallet: tronWeb.defaultAddress.base58,
          isVerified: true,
          firstName: userDetails.firstNames,
          lastName: userDetails.lastName,
          email: userDetails.email,
          signHash: signature,
        });
      } else {
        setStatus("Message Verification Failed");
      }
    } catch (error) {
      console.error("Error signing message: ", error);
    }
  };

  return (
    <div className="container">
      <img src={logo1} alt="DBM Academy" className="logo-top-left" />
      <p className="welcomeMessage">
        Hello <strong>{userDetails.firstNames}</strong>, In order to protect and
        verify all the participants in the TEAMFUND, we require you to sign a
        message from the Tronlink wallet associated with your TEAMFUND. This way
        you can receive and have access to your money and we can safely proceed
        with the payout in a few days.
      </p>
      <p className="welcomeMessage">
        The message you will sign with your wallet is:{" "}
        <strong>
          I am responsible for this wallet and I authorize this wallet to
          receive payouts from TEAMFUND.
        </strong>
      </p>
      <div className="buttons">
        <button className="button" onClick={connectWallet}>
          Connect Wallet
        </button>
        {!signDisabled && (
          <button
            className="button"
            onClick={signMessage}
            disabled={signDisabled}
          >
            Sign Message
          </button>
        )}
      </div>
      <div className="walletStatus">
        <p>{status}</p>
      </div>
      {walletVerified && (
        <p>
          Congratulations, you just secured your next payout. <br />
          If you have another wallet address linked to another TEAMFUND, please
          repeat the process by refreshing this page.
        </p>
      )}
    </div>
  );
}

export default WalletVerification;
