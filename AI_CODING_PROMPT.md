\# Onelab Payment Reconciliation — AI Coding Prompt



\## 1. Distilled Prompt



Build a payment reconciliation web application that compares payment platform transactions with bank settlement records using CSV data. Identify matched transactions, missing settlements, late settlements, duplicate entries, aggregate rounding differences, and orphan refunds. Create a React frontend dashboard and a Node.js/Express backend. Display reconciliation summaries, exception details, and matched transactions. Use deterministic reconciliation logic rather than relying on an LLM for financial calculations.



\## 2. Raw Prompt



Build a complete Payment Reconciliation application for an assessment.



Technology:

\- Frontend: React with Vite

\- Backend: Node.js and Express

\- Data: CSV files



Requirements:

1\. Read platform transaction and bank settlement CSV files.

2\. Match transactions using transaction IDs.

3\. Detect transactions settled in the following month.

4\. Detect duplicate bank settlement entries.

5\. Detect aggregate rounding differences that become visible when amounts are summed.

6\. Detect refunds whose original payment does not exist.

7\. Display matched transactions and reconciliation exceptions.

8\. Create a dashboard with total transactions, matched transactions, total issues, platform total, bank total, and settlement difference.

9\. Include filtering of reconciliation issues and a refresh function.

10\. Keep the reconciliation logic deterministic and explain the assumptions.

11\. Provide clear setup instructions and test cases.



Do not use an AI model to make financial matching decisions. Use deterministic code for reconciliation.



\## 3. Execution Record



The prompt above is prepared as documentation. It has not yet been submitted to a separate AI coding agent, so no coding-agent execution transcript is claimed here.

