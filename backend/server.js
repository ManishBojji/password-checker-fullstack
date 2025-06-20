const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/breach/:prefix", async (req, res) => {
  const { prefix } = req.params;
  try {
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Error from HIBP API");
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
