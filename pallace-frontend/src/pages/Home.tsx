import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import regression, { DataPoint } from "regression";
import "./Home.css";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import Header from "../pages/Header";
import { fetchInvoices, Invoice } from "../services/invoiceService";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [cashFlow, setCashFlow] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [netProfitPercentage, setNetProfitPercentage] = useState<number>(0);
  const [burnRate, setBurnRate] = useState<number>(0);

  const loadInvoices = useCallback(async () => {
    try {
      const sentData = await fetchInvoices("SENT");
      const receivedData = await fetchInvoices("RECEIVED");

      const sentTotals = sentData.map((invoice: Invoice) => invoice.total);
      const receivedTotals = receivedData.map(
        (invoice: Invoice) => invoice.total
      );

      const totalCashFlow = sentTotals.reduce((acc, curr) => acc + curr, 0);
      const totalExpenses = receivedTotals.reduce((acc, curr) => acc + curr, 0);
      const totalNetProfit = totalCashFlow - totalExpenses;
      const netProfitPercentage =
        totalCashFlow !== 0 ? (totalNetProfit / totalCashFlow) * 100 : 0;
      const numberOfMonths = sentTotals.length; // Use the actual length of sent totals
      const calculatedBurnRate = totalExpenses / numberOfMonths;

      setCashFlow(totalCashFlow);
      setExpenses(totalExpenses);
      setNetProfit(totalNetProfit);
      setNetProfitPercentage(netProfitPercentage);
      setBurnRate(calculatedBurnRate);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  return (
    <div className="home-container">
      <Header />
      <main className="home-main">
        <section className="home-summary">
          <div className="summary-card">
            <h3>Cash Flow</h3>
            <p>${cashFlow.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Net Profit</h3>
            <p>{netProfitPercentage.toFixed(2)}%</p>
            <span
              className={
                netProfitPercentage >= 0 ? "positive-change" : "negative-change"
              }
            >
              {netProfitPercentage >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(netProfitPercentage).toFixed(2)}%
            </span>
          </div>
          <div className="summary-card">
            <h3>Burn Rate</h3>
            <p>${burnRate.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Expenses</h3>
            <p>${expenses.toLocaleString()}</p>
          </div>
        </section>
        <LineChart />
        <section className="home-expenses">
          <div className="expenses-card">
            <h3>All Expenses</h3>
            <div className="expenses-info">
              <div>Daily: $475</div>
              <div>Weekly: $3,327</div>
              <div>Monthly: $12,131</div>
            </div>
            <div className="expenses-chart">
              <PieChart />
            </div>
          </div>
          <div className="transactions-card">
            <h3>History Transactions</h3>
            <a href="/" className="view-all">
              View all
            </a>
            <ul className="transactions-list">
              <li className="transaction-item positive">
                <span>Sale</span>
                <span>Apr 27, 22</span>
                <span>+ $874</span>
              </li>
              <li className="transaction-item negative">
                <span>Payment</span>
                <span>Apr 25, 22</span>
                <span>- $2,490</span>
              </li>
              <li className="transaction-item positive">
                <span>Sale</span>
                <span>Mar 1, 22</span>
                <span>+ $126</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
