
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/reconcile";

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })}`;
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Could not retrieve reconciliation results.");
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        "Unable to connect to the backend. Make sure your Node.js server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const issues = data?.issues || [];
  const matched = data?.matched || [];

  const filteredIssues = useMemo(() => {
    if (filter === "ALL") return issues;
    return issues.filter((issue) => issue.type === filter);
  }, [issues, filter]);

  const issueTypes = [
    { value: "ALL", label: "All issues" },
    { value: "DUPLICATE_ENTRY", label: "Duplicates" },
    { value: "LATE_SETTLEMENT", label: "Late settlements" },
    { value: "ROUNDING_DIFFERENCE", label: "Rounding" },
    { value: "ORPHAN_REFUND", label: "Orphan refunds" },
    { value: "MISSING_SETTLEMENT", label: "Missing settlements" },
  ];

  const issueLabel = (type) => {
    const labels = {
      DUPLICATE_ENTRY: "Duplicate entry",
      LATE_SETTLEMENT: "Late settlement",
      ROUNDING_DIFFERENCE: "Rounding difference",
      ORPHAN_REFUND: "Orphan refund",
      MISSING_SETTLEMENT: "Missing settlement",
      INVALID_AMOUNT: "Invalid amount",
    };
    return labels[type] || type;
  };

  const issueIcon = (type) => {
    const icons = {
      DUPLICATE_ENTRY: "⧉",
      LATE_SETTLEMENT: "◷",
      ROUNDING_DIFFERENCE: "≈",
      ORPHAN_REFUND: "↩",
      MISSING_SETTLEMENT: "!",
      INVALID_AMOUNT: "⚠",
    };
    return icons[type] || "!";
  };

  if (loading && !data) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <h2>Preparing your reconciliation dashboard...</h2>
        <p>Connecting to the payment reconciliation engine</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h2>Reconcile<span>.</span></h2>
            <small>PAYMENT OPERATIONS</small>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><span>▦</span> Overview</div>
        <div className="nav-item"><span>⇄</span> Transactions</div>
        <div className="nav-item"><span>⚑</span> Exceptions</div>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>Reconciliation engine</strong>
              <small>System operational</small>
            </div>
          </div>
          <small className="version">ONELAB ASSESSMENT · V1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / Overview</div>
            <h1>Payment reconciliation</h1>
            <p className="subtitle">Monitor, match and investigate payment settlements.</p>
          </div>
          <button className="refresh-button" onClick={loadData} disabled={loading}>
            <span>{loading ? "◌" : "↻"}</span>
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </header>

        {error && (
          <div className="error-banner">
            <strong>Connection error</strong>
            <span>{error}</span>
            <button onClick={loadData}>Retry</button>
          </div>
        )}

        {data && (
          <>
            <div className="overview-row">
              <div>
                <span className="eyebrow">RECONCILIATION OVERVIEW</span>
                <h2>October 2026 settlement report</h2>
              </div>
              <div className="updated-label">
                <span className="status-dot" />
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Live data"}
              </div>
            </div>

            <section className="stats-grid">
              <StatCard
                label="Platform transactions"
                value={data.summary.totalTransactions}
                detail="Payment records received"
                icon="▤"
                color="blue"
              />
              <StatCard
                label="Matched transactions"
                value={data.summary.matchedTransactions}
                detail={`${data.summary.totalTransactions
                  ? Math.round(
                      (data.summary.matchedTransactions /
                        data.summary.totalTransactions) * 100
                    )
                  : 0}% of platform payments matched`}
                icon="✓"
                color="green"
              />
              <StatCard
                label="Total exceptions"
                value={data.summary.totalIssues}
                detail="Items requiring attention"
                icon="⚑"
                color="orange"
              />
              <StatCard
                label="Settlement difference"
                value={formatMoney(
                  data.summary.platformTotal - data.summary.bankTotal
                )}
                detail="Platform total minus bank total"
                icon="≈"
                color="purple"
              />
            </section>

            <section className="amount-grid">
              <div className="amount-card">
                <div className="amount-heading">
                  <span className="amount-icon blue-bg">↗</span>
                  <span>Platform total</span>
                </div>
                <h2>{formatMoney(data.summary.platformTotal)}</h2>
                <small>Amount recorded by payment platform</small>
              </div>
              <div className="amount-card">
                <div className="amount-heading">
                  <span className="amount-icon green-bg">↙</span>
                  <span>Bank settlement total</span>
                </div>
                <h2>{formatMoney(data.summary.bankTotal)}</h2>
                <small>Amount received in bank records</small>
              </div>
              <div className="amount-card difference-card">
                <div className="amount-heading">
                  <span className="amount-icon purple-bg">≈</span>
                  <span>Net difference</span>
                </div>
                <h2>{formatMoney(
                  data.summary.platformTotal - data.summary.bankTotal
                )}</h2>
                <small>Aggregate reconciliation variance</small>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">INVESTIGATION</span>
                  <h2>Reconciliation exceptions</h2>
                  <p>Review discrepancies identified during matching.</p>
                </div>
                <span className="issue-count">{issues.length} issues found</span>
              </div>

              <div className="filter-row">
                {issueTypes.map((item) => (
                  <button
                    key={item.value}
                    className={`filter-button ${filter === item.value ? "selected" : ""}`}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ISSUE TYPE</th>
                      <th>TRANSACTION</th>
                      <th>DETAILS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue, index) => {
                      const transaction =
                        issue.transactionId ||
                        issue.refundId ||
                        issue.originalTransactionId ||
                        "Aggregate";

                      const amount =
                        issue.amount ??
                        issue.difference ??
                        null;

                      return (
                        <tr key={`${issue.type}-${transaction}-${index}`}>
                          <td>
                            <span className="issue-type">
                              <span className="issue-icon">
                                {issueIcon(issue.type)}
                              </span>
                              {issueLabel(issue.type)}
                            </span>
                          </td>
                          <td className="transaction-id">{transaction}</td>
                          <td className="detail-cell">{issue.message}</td>
                          <td>{amount !== null ? formatMoney(amount) : "—"}</td>
                          <td><span className="status-badge">Needs review</span></td>
                        </tr>
                      );
                    })}
                    {filteredIssues.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No issues found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">TRANSACTION MATCHING</span>
                  <h2>Matched transactions</h2>
                  <p>Platform payments matched against bank settlements.</p>
                </div>
                <span className="matched-count">{matched.length} matched</span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>PLATFORM AMOUNT</th>
                      <th>BANK AMOUNT</th>
                      <th>VARIANCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((item) => (
                      <tr key={item.transactionId}>
                        <td className="transaction-id">{item.transactionId}</td>
                        <td>{formatMoney(item.platformAmount)}</td>
                        <td>{formatMoney(item.bankAmount)}</td>
                        <td>{formatMoney(item.platformAmount - item.bankAmount)}</td>
                        <td>
                          <span className={`match-badge ${
                            item.status === "LATE_SETTLEMENT" ? "late" : ""
                          }`}>
                            {item.status === "LATE_SETTLEMENT"
                              ? "Late settlement"
                              : "Matched"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {matched.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No matched transactions available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="footer">
              <span>Reconcile. · Payment reconciliation prototype</span>
              <span>Built for the ONELAB AI Native Engineer assessment</span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <h2>{value}</h2>
      <p>{detail}</p>
    </div>
  );
}

export default App;
