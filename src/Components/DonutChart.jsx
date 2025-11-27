import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const DonutChart = ({ title, value }) => {
  const options = {
    chart: {
      type: "pie",
      height: 220,
    },
    title: { text: title },
    plotOptions: {
      pie: {
        innerSize: "65%",
        dataLabels: {
          enabled: true,
          format: "{point.y}%",
        },
      },
    },
    series: [
      {
        name: title,
        data: [
          { name: "Completed", y: value, color: "#2DB77E" },
          { name: "Remaining", y: 100 - value, color: "#D6EDE3" },
        ],
      },
    ],
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default DonutChart;
