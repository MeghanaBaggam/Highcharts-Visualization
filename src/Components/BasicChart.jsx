import React from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Import and initialize modules
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsExportData from "highcharts/modules/export-data";
import HighchartsOfflineExporting from "highcharts/modules/offline-exporting";


if (typeof HighchartsExporting === 'function') {
  HighchartsExporting(Highcharts);
}
if (typeof HighchartsExportData === 'function') {
  HighchartsExportData(Highcharts);
}
if (typeof HighchartsOfflineExporting === 'function') {
  HighchartsOfflineExporting(Highcharts);
}
const mockData = [
  { month: "Jan", sales: 10 },
  { month: "Feb", sales: 20 },
  { month: "Mar", sales: 35 },
  { month: "Apr", sales: 25 },
  { month: "May", sales: 45 }
];

const BasicChart = () => {
  const options = {
    title: { text: "Mock Sales Data" },
    xAxis: { categories: mockData.map(item => item.month)  },
    yAxis: { title: { text: "Sales Amount" } },
    series: [{ name: "Sales", data: mockData.map(item => item.sales) }],
    accessibility: { enabled: false },
    exporting: { 
      enabled: true,    
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPDF",
            "downloadCSV",
          ]
        }
      }
    },
    credits: { enabled: false }
  };

  return (
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
            {mockData.map((row, index) => (
              <tr key={index}>
                <td>{row.month}</td>
                <td>{row.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default BasicChart;