
function normalizeRows(rows) {
  return rows.map((row) => {
    const normalized = {};

    for (const [key, value] of Object.entries(row)) {
      const cleanKey = key.replace(/^\uFEFF/, "").trim();
      normalized[cleanKey] =
        typeof value === "string" ? value.trim() : value;
    }

    return normalized;
  });
}

function reconcile(platformTransactions, bankSettlements) {
  const platform = normalizeRows(platformTransactions);
  const bankData = normalizeRows(bankSettlements);

  const issues = [];
  const matched = [];

  const payments = platform.filter(
    (t) => t.type?.toUpperCase() === "PAYMENT"
  );

  const refunds = platform.filter(
    (t) => t.type?.toUpperCase() === "REFUND"
  );

  const bankPayments = bankData.filter(
    (t) => t.type?.toUpperCase() === "PAYMENT"
  );

  const bankRefunds = bankData.filter(
    (t) => t.type?.toUpperCase() === "REFUND"
  );

  // 1. Detect duplicate bank settlements
  const bankGroups = new Map();

  bankPayments.forEach((bank) => {
    const id = bank.transaction_id;

    if (!bankGroups.has(id)) bankGroups.set(id, []);
    bankGroups.get(id).push(bank);
  });

  const duplicateIds = new Set();

  for (const [id, records] of bankGroups) {
    if (records.length > 1) {
      duplicateIds.add(id);

      issues.push({
        type: "DUPLICATE_ENTRY",
        transactionId: id,
        duplicateCount: records.length,
        message: "Duplicate bank settlement entry detected."
      });
    }
  }

  // 2. Match payments
  payments.forEach((transaction) => {
    const bankRecords = bankGroups.get(transaction.transaction_id) || [];

    if (bankRecords.length === 0) {
      issues.push({
        type: "MISSING_SETTLEMENT",
        transactionId: transaction.transaction_id,
        message: "No matching bank settlement found."
      });
      return;
    }

    const bank = bankRecords[0];

    const platformAmount = Number(transaction.amount);
    const bankAmount = Number(bank.amount);

    if (
      !Number.isFinite(platformAmount) ||
      !Number.isFinite(bankAmount)
    ) {
      issues.push({
        type: "INVALID_AMOUNT",
        transactionId: transaction.transaction_id,
        message: "Invalid transaction amount."
      });
      return;
    }

    const transactionMonth =
      transaction.transaction_date?.slice(0, 7);

    const settlementMonth =
      bank.settlement_date?.slice(0, 7);

    let status = "MATCHED";

    if (settlementMonth > transactionMonth) {
      status = "LATE_SETTLEMENT";

      issues.push({
        type: "LATE_SETTLEMENT",
        transactionId: transaction.transaction_id,
        platformDate: transaction.transaction_date,
        settlementDate: bank.settlement_date,
        amount: platformAmount,
        message: "Transaction settled in a later month."
      });
    }

    matched.push({
      transactionId: transaction.transaction_id,
      platformAmount,
      bankAmount,
      status
    });
  });

  // 3. Aggregate comparison using unique bank transactions.
  // Duplicate bank entries are excluded from the total.
  const uniqueBankPayments = bankPayments.filter(
    (bank, index, array) =>
      array.findIndex(
        (item) => item.transaction_id === bank.transaction_id
      ) === index
  );

  // Use thousandths to preserve the three-decimal test values.
  const platformTotal = payments.reduce(
    (sum, t) => sum + Math.round(Number(t.amount) * 1000),
    0
  );

  const bankTotal = uniqueBankPayments.reduce(
    (sum, t) => sum + Math.round(Number(t.amount) * 1000),
    0
  );

  const difference = platformTotal - bankTotal;

  if (difference !== 0) {
    issues.push({
      type: "ROUNDING_DIFFERENCE",
      platformTotal: platformTotal / 1000,
      bankTotal: bankTotal / 1000,
      difference: difference / 1000,
      message: "Aggregate amount difference detected."
    });
  }

  // 4. Detect refunds without an original payment
  refunds.forEach((refund) => {
    const originalExists = payments.some(
      (payment) =>
        payment.transaction_id === refund.original_transaction_id
    );

    if (!originalExists) {
      issues.push({
        type: "ORPHAN_REFUND",
        refundId: refund.transaction_id,
        originalTransactionId: refund.original_transaction_id,
        amount: Number(refund.amount),
        message: "Refund has no matching original payment."
      });
    }
  });

  return {
    summary: {
      totalTransactions: payments.length,
      matchedTransactions: matched.length,
      totalIssues: issues.length,
      platformTotal: platformTotal / 1000,
      bankTotal: bankTotal / 1000
    },
    matched,
    issues
  };
}

module.exports = reconcile;
