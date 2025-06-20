// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/breach/:prefix", async (req, res) => {
  const prefix = req.params.prefix;

  try {
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    res.send(response.data);
  } catch (error) {
    console.error("HIBP API error:", error.message);
    res.status(500).send("Error contacting HIBP API");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
