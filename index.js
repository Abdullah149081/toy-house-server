const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("toy house server is running");
});

app.listen(port, () => {
  console.log(`toy house server is running ${port}`);
});
