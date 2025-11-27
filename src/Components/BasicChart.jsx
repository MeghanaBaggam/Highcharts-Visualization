import React, { useState, useRef } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

if (typeof HighchartsExporting === "function") {
  HighchartsExporting(Highcharts);
}

const BasicChart = () => {
  const [rows, setRows] = useState([]);          // full CSV data
  const [headers, setHeaders] = useState([]);    // CSV columns
  const [numericCols, setNumericCols] = useState([]); // auto-detected numeric columns

  const [chartType, setChartType] = useState("line");
  const [xCol, setXCol] = useState("");          // selected X-axis
  const [yCols, setYCols] = useState([]);        // selected Y-axis columns (multiple)

  const chartRef = useRef(null);
  const tableRef = useRef(null);

  // ---------- Handle CSV Upload ----------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        const data = results.data || [];
        const cols = results.meta.fields || [];
        console.log("Parsed data:", data);

        setRows(data);
        setHeaders(cols);

        // detect numeric columns
        const nums = cols.filter((col) =>
          data.some((row) => typeof row[col] === "number" && !isNaN(row[col]))
        );
        setNumericCols(nums);

        // defaults
        if (cols.length > 0) {
          setXCol(cols[0]);                 // first column as default X
        }
        if (nums.length > 0) {
          setYCols([nums[0]]);              // first numeric as default Y
        }
      },
    });
  };

  // ---------- Handle Y-axis selection (checkboxes) ----------
  const toggleYCol = (col) => {
    setYCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  // ---------- Build Chart Series & Categories ----------
  let categories = [];
  let series = [];

  if (rows.length > 0 && xCol) {
    categories = rows.map((r) =>
      r[xCol] !== undefined && r[xCol] !== null ? String(r[xCol]) : ""
    );

    if (chartType === "pie" && yCols.length === 1) {
      // Pie uses first selected Y column
      const yCol = yCols[0];
      series = [
        {
          type: "pie",
          name: yCol,
          data: rows.map((r) => ({
            name: String(r[xCol]),
            y: Number(r[yCol]) || 0,
          })),
        },
      ];
    } else {
      // Other chart types: multiple Y series
      const colsToUse = yCols.length > 0 ? yCols : numericCols;
      series = colsToUse.map((col) => ({
        name: col,
        data: rows.map((r) => Number(r[col]) || 0),
      }));
    }
  }

  const options = {
    chart: { type: chartType },
    title: { text: "CSV Auto Report" },
    xAxis:
      chartType === "pie"
        ? undefined
        : {
            categories,
            title: { text: xCol || "X Axis" },
          },
    yAxis:
      chartType === "pie"
        ? undefined
        : {
            title: { text: "Values" },
          },
    series,
    accessibility: { enabled: false },
    exporting: { enabled: false },
    credits: { enabled: false },
  };

  // ---------- Comparison Summary (per numeric column) ----------
  const getStats = (col) => {
    const vals = rows
      .map((r) => Number(r[col]))
      .filter((v) => !isNaN(v));

    if (vals.length === 0) return null;

    const count = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = sum / count;

    return {
      count,
      sum: sum.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
    };
  };

  // ---------- Export PDF (chart + table side by side) ----------
  const exportPDF = async () => {
    const pdf = new jsPDF("l", "mm", "a4"); // landscape

    const chartCanvas = await html2canvas(chartRef.current, { scale: 2 });
    const chartImg = chartCanvas.toDataURL("image/png");

    const tableCanvas = await html2canvas(tableRef.current, { scale: 2 });
    const tableImg = tableCanvas.toDataURL("image/png");

    // Side-by-side
    pdf.addImage(chartImg, "PNG", 10, 25, 130, 90);   // left
    pdf.addImage(tableImg, "PNG", 150, 25, 130, 90);  // right

    pdf.save("csv_auto_report.pdf");
  };

  return (
    <div>
      {/* Upload */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: 12 }}
      />

      {/* Chart type */}
      <select
        value={chartType}
        onChange={(e) => setChartType(e.target.value)}
        style={{ marginRight: 8 }}
      >
        <option value="line">Line</option>
        <option value="column">Column</option>
        <option value="bar">Bar</option>
        <option value="area">Area</option>
        <option value="pie">Pie</option>
      </select>

      {/* X-axis selector */}
      {headers.length > 0 && (
        <select
          value={xCol}
          onChange={(e) => setXCol(e.target.value)}
          style={{ marginRight: 8 }}
        >
          {headers.map((h) => (
            <option key={h} value={h}>
              X: {h}
            </option>
          ))}
        </select>
      )}

      {/* Y-axis selector (checklist of numeric columns) */}
      {numericCols.length > 0 && (
        <span style={{ marginRight: 8 }}>
          Y:
          {numericCols.map((col) => (
            <label key={col} style={{ marginLeft: 6 }}>
              <input
                type="checkbox"
                checked={yCols.includes(col)}
                onChange={() => toggleYCol(col)}
              />
              {col}
            </label>
          ))}
        </span>
      )}

      {/* Export button */}
      <button onClick={exportPDF} className="export">
        Export PDF
      </button>

      <div className="chart-table-container">
        {/* CHART (left) */}
        <div className="chart-section" ref={chartRef}>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>

        {/* COMPARISON TABLE (right) */}
        <div className="table-section" ref={tableRef}>
          <div className="table-title">Comparison Report</div>

          {numericCols.length === 0 ? (
            <p>No numeric columns detected in this CSV.</p>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Count</th>
                  <th>Sum</th>
                  <th>Average</th>
                  <th>Min</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {numericCols.map((col) => {
                  const stats = getStats(col);
                  if (!stats) return null;
                  return (
                    <tr key={col}>
                      <td>{col}</td>
                      <td>{stats.count}</td>
                      <td>{stats.sum}</td>
                      <td>{stats.avg}</td>
                      <td>{stats.min}</td>
                      <td>{stats.max}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicChart;
