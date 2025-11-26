import React, { useState,useRef } from "react";

import Highcharts, { chart } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

if (typeof HighchartsExporting === "function") {
  HighchartsExporting(Highcharts);
}

const BasicChart = () => {
  const [data, setData] = useState([]);
  const [chartType,setChartType]=useState("line");

  const chartRef = useRef(null);
  const tableRef = useRef(null);

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

  const exportPDF=async()=>{
    const pdf=new jsPDF("p","mm","a4");
    const chartCanvas=await html2canvas(chartRef.current);
    const chartImg = chartCanvas.toDataURL("image/png"); 
     pdf.addImage(chartImg, "PNG", 10, 10, 190, 90);

     const tableCanvas = await html2canvas(tableRef.current);
    const tableImg = tableCanvas.toDataURL("image/png");
    pdf.addImage(tableImg, "PNG", 10, 110, 190, 0);

    pdf.save("chart_with_table.pdf");
  }

  const options = {
    chart:{type:chartType},
    title: { text: "Mock Sales Data" },
    xAxis: { categories: data.map((d) => d.month) },
    yAxis: { title: { text: "Sales Amount" } },
    series: [{ name: "Sales", data: data.map((d) => Number(d.sales)) }],
    accessibility: { enabled: false },
    exporting: { enabled: false },
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
      <select value={chartType} onChange={(e)=>setChartType(e.target.value)}>
        <option value="line">Line</option>
         <option value="column">Column</option>
          <option value="Bar">Bar</option>
      </select>
    
       <button
        onClick={exportPDF}
        className="export"
      >
        Export
      </button>

      <div className="chart-table-container">
        <div className="chart-section" ref={chartRef}>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>

        <div className="table-section" ref={tableRef}>
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
