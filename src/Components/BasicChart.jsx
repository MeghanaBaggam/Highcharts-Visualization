import React, { useState, useRef } from "react";
import Papa from "papaparse";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BasicChart = () => {
  const [state, setState] = useState({
    rows: [],
    headers: [],
    numericCols: [],
    xCol: "",
    loadingPDF: false,
  });

  const reportRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        const raw = results.data || [];
        const cols = results.meta.fields || [];

        const cleanData = raw.filter((row) =>
          Object.values(row).some(
            (v) => v !== "" && v !== null && v !== undefined
          )
        );

        const nums = cols.filter((col) =>
          cleanData.some((row) => !isNaN(Number(row[col])))
        );

        setState((prev) => ({
          ...prev,
          rows: cleanData,
          headers: cols,
          numericCols: nums,
          xCol: cols.length > 0 ? cols[0] : "",
        }));
      },
    });
  };

  const { rows, headers, numericCols, xCol, loadingPDF } = state;

  const primaryMetric = numericCols[0] || null;
  const secondaryMetric = numericCols[1] || null;

  const getStats = (col) => {
    const vals = rows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    if (!vals.length) return null;

    const count = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    return {
      count,
      sum: sum.toFixed(2),
      avg: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
    };
  };

  const categories =
    rows.length > 0 && xCol ? rows.map((r) => String(r[xCol] ?? "")) : [];

  const getGroupedByX = () => {
    const result = {};
    if (!primaryMetric || !xCol) return { cats: [], vals: [] };

    rows.forEach((r) => {
      const key = String(r[xCol] ?? "Unknown");
      const val = Number(r[primaryMetric]) || 0;
      result[key] = (result[key] || 0) + val;
    });

    const cats = Object.keys(result);
    const vals = cats.map((c) => result[c]);
    return { cats, vals };
  };

  const { cats: groupCats, vals: groupVals } = getGroupedByX();

  const kpis = [];
  if (rows.length > 0) {
    kpis.push({
      label: "Total Rows",
      value: rows.length,
      sub: "Records in uploaded CSV",
    });

    numericCols.slice(0, 3).forEach((col) => {
      const s = getStats(col);
      if (s) {
        kpis.push({
          label: col,
          value: s.avg,
          sub: `Min: ${s.min} • Max: ${s.max}`,
        });
      }
    });
  }

  const lineOptions =
    primaryMetric && categories.length
      ? {
          chart: { type: "line" },
          title: { text: `${primaryMetric} Trend over ${xCol}` },
          xAxis: { categories },
          yAxis: { title: { text: primaryMetric } },
          series: [
            {
              name: primaryMetric,
              data: rows.map((r) => Number(r[primaryMetric]) || 0),
            },
          ],
        }
      : null;

  const columnOptions =
    numericCols.length && categories.length
      ? {
          chart: { type: "column" },
          title: { text: "Numeric Columns Comparison" },
          xAxis: { categories },
          yAxis: { title: { text: "Values" } },
          series: numericCols.map((col) => ({
            name: col,
            data: rows.map((r) => Number(r[col]) || 0),
          })),
        }
      : null;

  const areaOptions =
    primaryMetric && categories.length
      ? {
          chart: { type: "area" },
          title: { text: `${primaryMetric} Area Chart` },
          xAxis: { categories },
          yAxis: { title: { text: primaryMetric } },
          series: [
            {
              name: primaryMetric,
              data: rows.map((r) => Number(r[primaryMetric]) || 0),
            },
          ],
        }
      : null;

  const barOptions =
    primaryMetric && groupCats.length
      ? {
          chart: { type: "column", inverted: true },
          title: { text: `${primaryMetric} by ${xCol} (Bar)` },
          xAxis: { categories: groupCats },
          yAxis: { title: { text: primaryMetric } },
          series: [{ data: groupVals }],
        }
      : null;

  const pieOptions =
    primaryMetric && groupCats.length
      ? {
          chart: { type: "pie" },
          title: { text: `${primaryMetric} Share by ${xCol}` },
          series: [
            {
              type: "pie",
              data: groupCats.map((c, i) => ({
                name: c,
                y: groupVals[i],
              })),
            },
          ],
        }
      : null;

  const scatterOptions =
    primaryMetric && secondaryMetric
      ? {
          chart: { type: "scatter" },
          title: { text: `${secondaryMetric} vs ${primaryMetric}` },
          xAxis: { title: { text: primaryMetric } },
          yAxis: { title: { text: secondaryMetric } },
          series: [
            {
              name: "Scatter Data",
              data: rows
                .map((r) => [
                  Number(r[primaryMetric]),
                  Number(r[secondaryMetric]),
                ])
                .filter(([x, y]) => !isNaN(x) && !isNaN(y)),
            },
          ],
        }
      : null;

  const exportPDF = async () => {
    if (!reportRef.current) return;

    setState((prev) => ({ ...prev, loadingPDF: true }));

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFFFFF",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("csv_full_report.pdf");

    setState((prev) => ({ ...prev, loadingPDF: false }));
  };

  return (
    <div className="page-wrapper">
      {loadingPDF && (
        <div className="pdf-loader">Generating PDF… please wait</div>
      )}

      <div className="controls-row">
        {headers.length > 0 && (
          <select
            value={xCol}
            onChange={(e) =>
              setState((prev) => ({ ...prev, xCol: e.target.value }))
            }
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                X: {h}
              </option>
            ))}
          </select>
        )}

        <button onClick={exportPDF} className="export-btn">
          Export Report PDF
        </button>
      </div>

      <div className="report-container" ref={reportRef}>
        <div className="report-title">CSV Insight Report</div>

        <div className="kpi-row">
          {kpis.map((k, i) => (
            <div className="kpi-card" key={i}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="placeholder">
            <div style={{ fontSize: "18px", marginBottom: "12px" }}>
              Upload a CSV file to see the full report.
            </div>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        ) : (
          <>
            <div className="charts-row">
              <div className="chart-box">
                {lineOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={lineOptions}
                  />
                )}
              </div>
              <div className="chart-box">
                {pieOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={pieOptions}
                  />
                )}
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-box">
                {columnOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={columnOptions}
                  />
                )}
              </div>
              <div className="chart-box">
                {barOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={barOptions}
                  />
                )}
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-box">
                {areaOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={areaOptions}
                  />
                )}
              </div>
              <div className="chart-box">
                {scatterOptions && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={scatterOptions}
                  />
                )}
              </div>
            </div>

            <div className="table-panel full-width">
              <div className="table-title">Comparison Summary</div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Count</th>
                    <th>Sum</th>
                    <th>Avg</th>
                    <th>Min</th>
                    <th>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {numericCols.map((col) => {
                    const s = getStats(col);
                    if (!s) return null;
                    return (
                      <tr key={col}>
                        <td>{col}</td>
                        <td>{s.count}</td>
                        <td>{s.sum}</td>
                        <td>{s.avg}</td>
                        <td>{s.min}</td>
                        <td>{s.max}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BasicChart;
