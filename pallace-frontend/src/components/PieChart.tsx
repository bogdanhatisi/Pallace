import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart: React.FC = () => {
  const data = {
    labels: ["3rd Party Vendors", "Workspace", "Platform", "Salaries"],
    datasets: [
      {
        data: [30000, 20000, 15000, 40000],
        backgroundColor: ["#007bff", "#dc3545", "#ffc107", "#28a745"],
        hoverBackgroundColor: ["#0056b3", "#a71d2a", "#d39e00", "#1e7e34"],
      },
    ],
  };

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
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
