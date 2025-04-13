const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// ✅ Correct Middleware Placement
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Ensure JSON parsing is enabled

const API_URL = "https://sandbox.api-setu.in/certificate/v3/transport/rvcer";
const API_KEY = process.env.API_KEY || "demokey123456ABCD789";

// Route to fetch vehicle data
app.post("/api/vehicle-data", async (req, res) => {
  
  try {
    console.log("🔵 Received Content-Type:", req.headers["content-type"]);
    console.log("🔵 Received Body:", req.body);
    console.log("🔵 Raw Request Body:", req.body); // Ensure it's a valid JSON
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Invalid JSON payload received" });
    }

    const requestData = {
      txnId: "f7f1469c-29b0-4325-9dfc-c567200a70f7",
      format: "xml",
      certificateParameters: req.body,
      consentArtifact: {
        consent: {
          consentId: "ea9c43aa-7f5a-4bf3-a0be-e1caa24737ba",
          timestamp: new Date().toISOString(),
          dataConsumer: { id: "string" },
          dataProvider: { id: "string" },
          purpose: { description: "Vehicle data request" },
          user: {
            idType: "AADHAAR",
            idNumber: req.body.UID,
            mobile: "9988776655",
            email: "test@email.com",
          },
          data: { id: "string" },
          permission: {
            access: "READ",
            dateRange: {
              from: new Date().toISOString(),
              to: new Date().toISOString(),
            },
            frequency: { unit: "HOUR", value: 1, repeats: 1 },
          },
        },
        signature: { signature: "string" },
      },
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        "Content-Type": "application/json",
        "X-APISETU-APIKEY": API_KEY,
        "X-APISETU-CLIENTID": "in.gov.sandbox",
        Accept: "application/xml",
      },
    });

    console.log("✅ API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("🚨 Error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
