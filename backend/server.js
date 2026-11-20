
const express = require("express");
const cors = require("cors");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const reconcile = require("./reconciliation");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Onelab Payment Reconciliation API is running!"
  });
});

// Read CSV files
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Run reconciliation
app.get("/api/reconcile", async (req, res) => {
  try {
    const platformPath = path.join(
      __dirname,
      "..",
      "test-data",
      "platform_transactions.csv"
    );

    const bankPath = path.join(
      __dirname,
      "..",
      "test-data",
      "bank_settlements.csv"
    );

    const platformTransactions = await readCSV(platformPath);
    const bankSettlements = await readCSV(bankPath);

    const result = reconcile(
      platformTransactions,
      bankSettlements
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Reconciliation failed."
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
