import React, { useState } from "react";
import WalletVerification from "./components/WalletVerification";
import EmailVerificationForm from "./components/EmailVerificationForm";
import "./App.css";

function App() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  const handleEmailVerification = (data) => {
    console.log("Email verification status: ", data.verified);
    setEmailVerified(data.verified);
    if (data.verified) {
      setUserDetails({
        email: data.email,
        firstNames: data.firstNames,
        lastName: data.lastName,
      });
    }
  };

  return (
    <div className="App">
      {!emailVerified ? (
        <EmailVerificationForm onEmailVerification={handleEmailVerification} />
      ) : (
        <WalletVerification userDetails={userDetails} />
      )}
    </div>
  );
}

export default App;
