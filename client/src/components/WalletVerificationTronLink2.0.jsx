// WalletVerification.js
import React, { useEffect, useState } from "react";
import axios from "axios"; // import axios to make HTTP requests
import logo1 from "../images/dbm.png";
import logo2 from "../images/prospera.png";
import TronWeb from "tronweb";

function WalletVerification({ userDetails }) {
  // const [tronWeb, setTronWeb] = useState(null);
  const [status, setStatus] = useState(`Please connect yout Tronlink Wallet`);
  const [signDisabled, setSignDisabled] = useState(true);
  const [walletVerified, setWalletVerified] = useState(false);

  // Initialize TronWeb
  let tronWeb;
  let tronLinkIsInstalled = false;

  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    tronWeb = window.tronWeb;
    tronLinkIsInstalled = true;
  } else {
    console.log("Waiting for TronLink...");
    tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
      headers: { "TRON-PRO-API-KEY": "fd65f063-d950-4df6-88e8-d6d882cbeeb2" },
    });
  }

  const requestAccess = async () => {
    if (tronLinkIsInstalled) {
      try {
        // This line requests access to the user's accounts
        await tronWeb.trx.request({ method: "tron_requestAccounts" });
      } catch (error) {
        console.error("User denied account access", error);
      }
    }
  };

  requestAccess();

  // Now you can use tronWeb as before...

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
            "Your wallet is not on the allowed list, please connect the wallet you used to participate on LifepassB"
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
        "I am responsible for this wallet and I authorize this wallet to receive payouts from the LifepassB Fund.";
      const signature = await tronWeb.trx.signMessageV2(message);

      const verifiedAddress = await tronWeb.trx.verifyMessageV2(
        message,
        signature
      );

      if (verifiedAddress === tronWeb.defaultAddress.base58) {
        setWalletVerified(true);
        setStatus("Signed Message: " + signature + "\n" + "Message Verified");
        await axios.post(process.env.REACT_APP_SERVER_URL + "/verify-wallet", {
          wallet: tronWeb.defaultAddress.base58,
          isVerified: true,
          firstName: userDetails.firstNames,
          lastName: userDetails.lastName,
          email: userDetails.email,
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
      <img src={logo2} alt="Prospera Global" className="logo-top-right" />{" "}
      <p className="welcomeMessage">
        Hello <strong>{userDetails.firstNames}</strong>, In order to protect and
        verify all the participants in the Lifepass B fund, we require you to
        sign a message with your wallet, this way you are 100% sure you can
        receive and have access to your money and we can safely proceed with the
        payout in few days.
      </p>
      <p className="welcomeMessage">
        The message you will sign with your wallet is:{" "}
        <strong>
          I am responsible for this wallet and I authorize this wallet to
          receive payouts from the LifepassB Fund.
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
      {!walletVerified && (
        <p>
          Congratulations, you just secured your next payout.
          <br />
          You can now join the{" "}
          <a href="https://t.me/+A8ThlSBvLPZhMTlk">
            LifepassB payouts Telegram Group here
          </a>{" "}
          for further details.
        </p>
      )}
    </div>
  );
}

export default WalletVerification;
