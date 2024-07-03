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
import "./LineChart.css";

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
  const [predictedExpenses, setPredictedExpenses] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [showCashFlow, setShowCashFlow] = useState<boolean>(true);
  const [showExpenses, setShowExpenses] = useState<boolean>(true);
  const [showPredictedCashFlow, setShowPredictedCashFlow] =
    useState<boolean>(true);
  const [showPredictedExpenses, setShowPredictedExpenses] =
    useState<boolean>(true);

  const groupByMonthYear = (invoices: Invoice[]): { [key: string]: number } => {
    const monthlyTotals: { [key: string]: number } = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0;
      }

      monthlyTotals[monthYear] += invoice.total;
    });

    return monthlyTotals;
  };

  const generateFilledLabelsAndTotals = (
    startDate: Date,
    endDate: Date,
    monthlyData: { [key: string]: number }
  ): { labels: string[]; totals: number[] } => {
    const labels = [];
    const totals = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthYear = `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }`;
      labels.push(`${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`);
      totals.push(monthlyData[monthYear] || 0);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { labels, totals };
  };

  const loadData = useCallback(async () => {
    try {
      const sentData = await fetchInvoices("SENT");
      const receivedData = await fetchInvoices("RECEIVED");

      if (sentData.length === 0 && receivedData.length === 0) {
        setLabels([]);
        setSentTotals([]);
        setReceivedTotals([]);
        setPredictedCashFlow([]);
        setPredictedExpenses([]);
        return;
      }

      const startDate = new Date(
        Math.min(
          ...sentData
            .concat(receivedData)
            .map((invoice) => new Date(invoice.createdAt).getTime())
        )
      );
      const lastInvoiceDate = new Date(
        Math.max(
          ...sentData
            .concat(receivedData)
            .map((invoice) => new Date(invoice.createdAt).getTime())
        )
      );
      const endDate = new Date(lastInvoiceDate);
      endDate.setMonth(endDate.getMonth());

      const sentMonthlyData = groupByMonthYear(sentData);
      const receivedMonthlyData = groupByMonthYear(receivedData);

      const { labels: filledLabels, totals: filledSentTotals } =
        generateFilledLabelsAndTotals(startDate, endDate, sentMonthlyData);
      const { totals: filledReceivedTotals } = generateFilledLabelsAndTotals(
        startDate,
        endDate,
        receivedMonthlyData
      );

      setLabels(filledLabels);
      setSentTotals(filledSentTotals);
      setReceivedTotals(filledReceivedTotals);

      if (filledSentTotals.length > 0 || filledReceivedTotals.length > 0) {
        populatePredictedData(
          filledSentTotals,
          filledReceivedTotals,
          filledLabels
        );
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const populatePredictedData = (
    sentTotals: number[],
    receivedTotals: number[],
    combinedLabels: string[]
  ) => {
    const futureMonths = 6; // Predict for the next 6 months
    const totalMonths = combinedLabels.length;

    // Linear regression for cash flow
    const cashFlowData: DataPoint[] = sentTotals.map((total, index) => [
      index + 1,
      total,
    ]);
    const cashFlowResult = regression.linear(cashFlowData);
    const cashFlowPredictions: number[] = [];
    for (let i = 1; i <= futureMonths; i++) {
      const futureMonth = totalMonths + i;
      const prediction = cashFlowResult.predict(futureMonth)[1];
      cashFlowPredictions.push(prediction);
    }
    setPredictedCashFlow(cashFlowPredictions);

    // Linear regression for expenses
    const expensesData: DataPoint[] = receivedTotals.map((total, index) => [
      index + 1,
      total,
    ]);
    const expensesResult = regression.linear(expensesData);
    const expensesPredictions: number[] = [];
    for (let i = 1; i <= futureMonths; i++) {
      const futureMonth = totalMonths + i;
      const prediction = expensesResult.predict(futureMonth)[1];
      expensesPredictions.push(prediction);
    }
    setPredictedExpenses(expensesPredictions);

    // Add prediction labels to the combined labels
    const lastLabel = combinedLabels[combinedLabels.length - 1];
    const [month, year] = lastLabel
      .split("-")
      .map((part) => parseInt(part, 10));
    const lastDate = new Date(year, month - 1);
    const predictionLabels = generateLabels(lastDate, futureMonths + 1).slice(
      1
    ); // Skip the first month, which is the last actual month
    setLabels([...combinedLabels, ...predictionLabels]);
  };

  const generateLabels = (startDate: Date, length: number): string[] => {
    const labels = [];
    for (let i = 0; i < length; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      labels.push(`${date.getMonth() + 1}-${date.getFullYear()}`);
    }
    return labels;
  };

  const getChartData = () => {
    const totalLength = labels.length;

    const predictedCashFlowData =
      sentTotals.length > 0 ? [...sentTotals, ...predictedCashFlow] : [];

    const predictedExpensesData =
      receivedTotals.length > 0
        ? [...receivedTotals, ...predictedExpenses]
        : [];

    return {
      labels: labels.slice(0, totalLength), // Slice the labels to match the length of the data
      datasets: [
        {
          label: "Actual Income",
          data: showCashFlow ? sentTotals : [],
          fill: true,
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderColor: "rgba(0, 123, 255, 1)",
          hidden: !showCashFlow,
        },
        {
          label: "Predicted Income",
          data:
            showPredictedCashFlow && showCashFlow ? predictedCashFlowData : [],
          fill: true,
          backgroundColor: "rgba(0, 255, 0, 0.2)",
          borderColor: "rgba(0, 255, 0, 1)",
          borderDash: [5, 5], // Add a dashed line for predicted values
          hidden: !showPredictedCashFlow,
        },
        {
          label: "Actual Expenses",
          data: showExpenses ? receivedTotals : [],
          fill: true,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          hidden: !showExpenses,
        },
        {
          label: "Predicted Expenses",
          data:
            showPredictedExpenses && showExpenses ? predictedExpensesData : [],
          fill: true,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderDash: [5, 5], // Add a dashed line for predicted values
          hidden: !showPredictedExpenses,
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
        text: "Income and Expenses",
      },
    },
    scales: {
      x: {
        type: "category" as const,
        labels: labels,
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
          Income
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
          Predict Income
        </button>
        <button
          className={showPredictedExpenses ? "active" : ""}
          onClick={() => setShowPredictedExpenses(!showPredictedExpenses)}
        >
          Predict Expenses
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
