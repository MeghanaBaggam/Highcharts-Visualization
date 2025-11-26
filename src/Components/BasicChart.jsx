import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Exporting from "highcharts/modules/exporting";

Exporting(Highcharts); 

const BasicChart = () => {
  const chartOptions = {
    title: {
      text: "Sample Sales Data",
    },
    xAxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    series: [
      {
        name: "Sales",
        data: [10, 25, 40, 20, 30],
      },
    ],
    exporting: {
      enabled: true, 
    },
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default BasicChart;
