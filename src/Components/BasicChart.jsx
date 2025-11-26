import React, { useState } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsExportData from "highcharts/modules/export-data";
import HighchartsOfflineExporting from "highcharts/modules/offline-exporting";
import Papa from "papaparse";

if (typeof HighchartsExporting === "function") {
  HighchartsExporting(Highcharts);
}
if (typeof HighchartsExportData === "function") {
  HighchartsExportData(Highcharts);
}
if (typeof HighchartsOfflineExporting === "function") {
  HighchartsOfflineExporting(Highcharts);
}

const BasicChart = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
     header: true,
      complete: function (results) {
        console.log("Parsed data:", results.data);
        setData(results.data);
      },
    });
  };
  const options = {
    title: { text: "Mock Sales Data" },
    xAxis: { categories: data.map((d) => d.month) },
    yAxis: { title: { text: "Sales Amount" } },
    series: [{ name: "Sales", data: data.map((d) => Number(d.sales)) }],
    accessibility: { enabled: false },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [""],
        },
      },
    },
    credits: { enabled: false },
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: 20 }}
      />

      <div className="chart-table-container">
        <div className="chart-section">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>

        <div className="table-section">
          <div className="table-title">Sales Table</div>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.month}</td>
                  <td>{row.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BasicChart;
