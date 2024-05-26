import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo-container">
          <img src="/logo.png" alt="Pallace Logo" className="home-logo" />
          <span className="logo-text">Pallace</span>
        </div>
        <nav className="home-nav">
          <a href="/" className="home-nav-item active">
            Overview
          </a>
          <a href="/" className="home-nav-item">
            Transaction
          </a>
          <a href="/" className="home-nav-item">
            Invoice
          </a>
          <a href="/" className="home-nav-item">
            Activity
          </a>
        </nav>
        <div className="home-header-icons">
          <img src="/sun-icon.svg" alt="Theme Toggle" className="icon" />
          <img src="/user-icon.svg" alt="User Profile" className="icon" />
        </div>
      </header>
      <main className="home-main">
        <section className="home-summary">
          <div className="summary-card">
            <h3>Cash Flow</h3>
            <p>$128,320</p>
          </div>
          <div className="summary-card">
            <h3>Net Profit</h3>
            <p>25.43%</p>
            <span className="positive-change">↑ 11.09%</span>
          </div>
          <div className="summary-card">
            <h3>Burn Rate</h3>
            <p>$35,320</p>
            <span className="negative-change">↓ 10.00%</span>
          </div>
          <div className="summary-card">
            <h3>Expenses</h3>
            <p>$128,320</p>
          </div>
        </section>
        <section className="home-reports">
          <h3>Reports</h3>
          <div className="reports-toggle">
            <button className="active">Cash Flow</button>
            <button>Expenses</button>
          </div>
          <div className="reports-chart">
            <LineChart />
          </div>
        </section>
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
