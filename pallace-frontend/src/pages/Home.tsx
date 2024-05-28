import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import Header from "../pages/Header";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/dashboard/homeUserData",
        {
          credentials: "include", // Include cookies in the request
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      } else {
        console.error("Failed to fetch user data");
        navigate("/login", {
          state: { message: "Please authenticate to continue" },
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login", {
        state: { message: "Please authenticate to continue" },
      });
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="home-container">
      <Header userName={userName} />
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
