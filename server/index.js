const express = require("express");
const path = require("path");
const database = require("./database");
const Wallet = require("./walletModel");
const app = express();
const cors = require("cors");
const axios = require("axios");
const auth = require("basic-auth");
const https = require("https");
require("dotenv").config();

// Middleware to parse JSON bodies
app.use(express.json());

// Control of the CSP
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https://api.trongrid.io;"
  );
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Enable CORS
app.use(cors());

// Simplero Check Contact
app.post("/find-contact", (req, res) => {
  const { email } = req.body;

  const options = {
    hostname: "simplero.com",
    path: "/api/v1/customers/find.json", // correct path
    method: "POST",
    headers: {
      "User-Agent": "DBMFundManager(seanmoloney@digitalbusinessmasters.co.uk)",
      Authorization:
        "Basic " +
        Buffer.from(process.env.SIMPLERO_APIKEY + ":").toString("base64"),
      "Content-Type": "application/json",
    },
  };

  const request = https.request(options, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      const parsedData = JSON.parse(data);
      if (parsedData.email) {
        // if the email field exists in the response, it means the email was found
        res.json({
          exists: true,
          email: parsedData.email,
          firstNames: parsedData.first_names,
          lastName: parsedData.last_name,
        });
      } else {
        res.json({ exists: false });
      }
    });
  });

  request.on("error", (error) => {
    res.status(500).json({ error: error.toString() });
  });

  request.write(JSON.stringify({ email: email }));
  request.end();
});

// Check if the current wallet is authorized
app.get("/allowed-wallets", async (req, res) => {
  try {
    const wallets = await Wallet.find({});
    res.json(wallets.map((wallet) => wallet.address));
  } catch (error) {
    console.error("Failed to fetch wallets: ", error);
    res.status(500).send("Failed to fetch wallets");
  }
});

// Check wallet endpoint
app.post("/check-wallet", async (req, res) => {
  const { wallet } = req.body;

  try {
    const walletToCheck = await Wallet.findOne({ wallet: wallet });

    if (!walletToCheck) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json({ wallet: walletToCheck });
  } catch (error) {
    console.error("Failed to check wallet: ", error);
    res.status(500).json({ error: "Failed to check wallet" });
  }
});

// Verify wallet endpoint
app.post("/verify-wallet", async (req, res) => {
  const { wallet, isVerified, firstName, lastName, email } = req.body;

  try {
    const walletToUpdate = await Wallet.findOne({ wallet: wallet });

    if (!walletToUpdate) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    walletToUpdate.verifiedWallet = isVerified;
    walletToUpdate.firstName = firstName;
    walletToUpdate.lastName = lastName;
    walletToUpdate.email = email;
    await walletToUpdate.save();

    res.json({ message: "Wallet verification status updated" });
  } catch (error) {
    console.error("Failed to verify wallet: ", error);
    res.status(500).json({ error: "Failed to verify wallet" });
  }
});

// Send index.html for any other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Connect to the database and start the server
database
  .connect()
  .then(async () => {
    const walletData = {
      firstName: "",
      lastName: "",
      email: "",
      wallet: "TX1NzMAWQR7LVWFmDiE6PUtDUaytcHPHP2",
    };

    try {
      // Check if the wallet already exists
      const existingWallet = await Wallet.findOne({
        wallet: walletData.wallet,
      });
      if (!existingWallet) {
        const newWallet = new Wallet(walletData);
        await newWallet.save();
        console.log("Sample wallet created successfully");
      }
    } catch (error) {
      console.error("Failed to create sample wallet: ", error);
    }

    // Set the port to listen on
    app.listen(process.env.PORT || 3000, function () {
      console.log("App is listening on port 3000!");
    });
  })
  .catch((error) => console.error("Failed to connect to database: ", error));

// Export the Express APi for Vercel
module.exports = app;
