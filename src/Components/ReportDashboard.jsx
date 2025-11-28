import React from "react";

const ReportDashboard = ({
  kpis = [],
  donuts = null,
  dotMatrix = null,
  table = null,
}) => {
  return (
    <div className="report-container">
      <div className="report-title">CSV Report</div>
      {kpis.length > 0 ? (
        <div className="kpi-row">
          {kpis.map((kpi, i) => (
            <div className="kpi-card" key={i}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
              {kpi.sub && <div className="kpi-sub">{kpi.sub}</div>}
            </div>
          ))}
        </div>
      ) : (
        null
      )}

      <div className="middle-row">

        <div className="donuts">
          {donuts ? (
            donuts
          ) : (
          null
          )}
        </div>

        <div className="heatmap">
          {dotMatrix ? (
            dotMatrix
          ) : (
           null
          )}
        </div>

      </div>

      {table ? (
        <div className="summary-table-section">{table}</div>
      ) : (
        null
      )}
    </div>
  );
};

export default ReportDashboard;
