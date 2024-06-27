import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchInvoices, Invoice } from "../services/invoiceService";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#007bff", "#dc3545", "#ffc107", "#28a745"],
        hoverBackgroundColor: ["#0056b3", "#a71d2a", "#d39e00", "#1e7e34"],
      },
    ],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const invoices = await fetchInvoices("RECEIVED");
        const categoryTotals: { [key: string]: number } = {};

        invoices.forEach((invoice: Invoice) => {
          if (invoice.category) {
            if (!categoryTotals[invoice.category]) {
              categoryTotals[invoice.category] = 0;
            }
            categoryTotals[invoice.category] += invoice.total;
          }
        });

        setChartData({
          labels: Object.keys(categoryTotals),
          datasets: [
            {
              data: Object.values(categoryTotals),
              backgroundColor: ["#007bff", "#dc3545", "#ffc107", "#28a745"],
              hoverBackgroundColor: [
                "#0056b3",
                "#a71d2a",
                "#d39e00",
                "#1e7e34",
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    loadData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
