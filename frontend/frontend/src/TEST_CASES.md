# Onelab Payment Reconciliation — Test Cases

## Test Environment
- Frontend: React + Vite
- Backend: Node.js + Express
- Test data: Platform transactions CSV and bank settlements CSV
- API: `/api/reconcile`

## Test Cases

| ID | Test Scenario | Expected Result |
|---|---|---|
| TC01 | Normal transaction matching | TXN001 matches successfully |
| TC02 | Following-month settlement | TXN007 is detected as a late settlement |
| TC03 | Duplicate bank entry | Duplicate TXN003 is detected |
| TC04 | Aggregate rounding difference | Aggregate difference of 0.015 is detected |
| TC05 | Refund with missing original payment | REF999 is detected as an orphan refund |
| TC06 | Valid refund | REF001 is not flagged as an orphan |
| TC07 | Multiple transaction matching | Nine payments are matched |
| TC08 | Dashboard loading | Dashboard displays reconciliation results |
| TC09 | Issue filtering | Selected issue category is displayed |
| TC10 | Dashboard refresh | Latest reconciliation results are loaded |

## Assumptions
1. Transaction IDs are used as the primary matching key.
2. Settlements occurring in a later calendar month are classified as late settlements.
3. Duplicate bank payment records are excluded from aggregate bank totals.
4. Three-decimal precision is used in the demonstration to identify aggregate rounding differences.
5. A refund is considered orphaned when its original payment does not exist in the platform records.
6. The prototype uses CSV files and does not connect to live banking systems.