import React, { useCallback, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import regression, { DataPoint } from "regression";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Invoice, fetchInvoices } from "../services/invoiceService";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart: React.FC = () => {
  const navigate = useNavigate();
  const [sentTotals, setSentTotals] = useState<number[]>([]);
  const [receivedTotals, setReceivedTotals] = useState<number[]>([]);
  const [predictedCashFlow, setPredictedCashFlow] = useState<number[]>([]);
  const [showCashFlow, setShowCashFlow] = useState<boolean>(false);
  const [showExpenses, setShowExpenses] = useState<boolean>(false);
  const [showPredictedCashFlow, setShowPredictedCashFlow] =
    useState<boolean>(false);

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const loadData = useCallback(async () => {
    try {
      const sentData = await fetchInvoices("SENT");
      const receivedData = await fetchInvoices("RECEIVED");

      const sentTotals = sentData.map((invoice: Invoice) => invoice.total);
      const receivedTotals = receivedData.map(
        (invoice: Invoice) => invoice.total
      );

      setSentTotals(sentTotals);
      setReceivedTotals(receivedTotals);

      if (sentTotals.length > 0) {
        populatePredictedCashFlow(sentTotals);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const populatePredictedCashFlow = (sentTotals: number[]) => {
    const numberOfMonths = sentTotals.length;

    // Prepare data for linear regression
    const cashFlowData: DataPoint[] = sentTotals.map((total, index) => [
      index + 1,
      total,
    ]);
    const result = regression.linear(cashFlowData);
    const predictions: number[] = [];
    const futureMonths = 6; // Predict for the next 6 months
    for (let i = 1; i <= futureMonths; i++) {
      const futureMonth = numberOfMonths + i;
      const prediction = result.predict(futureMonth)[1];
      predictions.push(prediction);
    }

    setPredictedCashFlow(predictions);
  };

  const getChartData = () => {
    const totalLength = sentTotals.length + predictedCashFlow.length;

    // Ensure proper concatenation of actual and predicted data
    const predictedData =
      sentTotals.length > 0
        ? Array(sentTotals.length - 1)
            .fill(null)
            .concat(sentTotals[sentTotals.length - 1])
            .concat(predictedCashFlow)
        : [];

    return {
      labels: labels.slice(0, totalLength), // Slice the labels to match the length of the data
      datasets: [
        {
          label: "Actual Cash Flow",
          data: showCashFlow ? sentTotals : [],
          fill: true,
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderColor: "rgba(0, 123, 255, 1)",
          hidden: !showCashFlow,
        },
        {
          label: "Predicted Cash Flow",
          data: showPredictedCashFlow ? predictedData : [],
          fill: true,
          backgroundColor: "rgba(0, 255, 0, 0.2)",
          borderColor: "rgba(0, 255, 0, 1)",
          borderDash: [5, 5], // Add a dashed line for predicted values
          hidden: !showPredictedCashFlow,
        },
        {
          label: "Expenses",
          data: showExpenses
            ? receivedTotals.concat(
                new Array(predictedCashFlow.length).fill(null)
              )
            : [], // Extend expenses data with null for predicted period
          fill: true,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          hidden: !showExpenses,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Cash Flow and Expenses",
      },
    },
  };

  return (
    <section className="home-reports">
      <h3>Reports</h3>
      <div className="reports-toggle">
        <button
          className={showCashFlow ? "active" : ""}
          onClick={() => setShowCashFlow(!showCashFlow)}
        >
          Cash Flow
        </button>
        <button
          className={showExpenses ? "active" : ""}
          onClick={() => setShowExpenses(!showExpenses)}
        >
          Expenses
        </button>
        <button
          className={showPredictedCashFlow ? "active" : ""}
          onClick={() => setShowPredictedCashFlow(!showPredictedCashFlow)}
        >
          Predict
        </button>
      </div>
      <div className="reports-chart">
        <div style={{ width: "100%", height: "400px" }}>
          <Line data={getChartData()} options={options} />
        </div>
      </div>
    </section>
  );
};

export default LineChart;
