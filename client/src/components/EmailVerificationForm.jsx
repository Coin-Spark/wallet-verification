import React, { useState } from "react";
import logo1 from "../images/dbm.png";

function EmailVerificationForm({ onEmailVerification }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const verifyEmail = async () => {
    setStatus("Verifying email...");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/find-contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (data.exists) {
        setStatus("Email verified");
        setEmailVerified(true);
        onEmailVerification({
          verified: true,
          email: data.email,
          firstNames: data.firstNames,
          lastName: data.lastName,
        });
      } else {
        setStatus("Email not registered in Simplero");
      }
    } catch (error) {
      console.error("Error verifying email: ", error);
      setStatus("Error verifying email");
    }
  };

  return (
    <div className="container">
      <img src={logo1} alt="DBM Academy" className="logo-top-left" />
      <h1>Lifepass B Payouts Wallet Verification</h1>
      <p className="welcomeMessage">
        This simple procedure aim to verify that you have access to your
        Tronlink Wallet before payouts will be sent.
        <br />
        In order to achieve a better comunication between all the participants
        of LifapassB, you are required to provide the email you used to register
        on dbm.academy. If you haven't already registered to DBM, please click{" "}
        <a href="https://www.dbm.education/purchase/186319-DBM-Academy-Basic-Membership">
          here
        </a>{" "}
        and sign up a Free account.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button className="verifyButton" onClick={verifyEmail}>
        Verify Email
      </button>
    </div>
  );
}

export default EmailVerificationForm;
