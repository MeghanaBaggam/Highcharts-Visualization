import React from "react";

const SummaryTable = ({ rows, numericCols }) => {
  const getStats = (col) => {
    const vals = rows
      .map((r) => Number(r[col]))
      .filter((v) => !isNaN(v));

    if (!vals.length) return null;

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

  if (!numericCols.length) {
    return <p>No numeric columns detected.</p>;
  }

  return (
    <div className="summary-table-wrapper">
      <div className="summary-title">Comparison Summary</div>

      <table className="summary-table">
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
  );
};

export default SummaryTable;
