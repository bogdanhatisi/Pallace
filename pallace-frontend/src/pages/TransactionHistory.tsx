import React, { useEffect, useState } from "react";
import Header from "./Header"; // Adjust the path if necessary
import { fetchInvoices, Invoice } from "../services/invoiceService";
import "./TransactionHistory.css";

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      const sentInvoices = await fetchInvoices("SENT");
      const receivedInvoices = await fetchInvoices("RECEIVED");

      const allInvoices = [...sentInvoices, ...receivedInvoices];
      allInvoices.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(allInvoices);
    } catch (error) {
      setError("Failed to load transaction history.");
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h1>Transaction History</h1>
        {error && <div className="error">{error}</div>}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice Type</th>
              <th>Category</th>
              <th>Invoice Name</th>
              <th>Link</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className={transaction.type.toLowerCase()}>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.type === "RECEIVED" ? "RECEIVED" : "SENT"}</td>
                <td>{transaction.category || "N/A"}</td>
                <td>{transaction.filePath.split("\\").pop()}</td>
                <td>
                  <a
                    href={`http://localhost:8000/api/storage/${transaction.filePath
                      .split("\\")
                      .slice(-2)
                      .join("/")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
                <td>{transaction.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TransactionHistory;
