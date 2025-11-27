import React from "react";
import "./report.css";

const ReportDashboard = ({ kpis, trends, donuts, table }) => {
  return (
    <div className="report-container">

      
      <div className="report-title">Auto-Generated CSV Report</div>

     
      <div className="kpi-row">
        {kpis.map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Trend Chart Section */}
      <div className="trend-section">
        {trends}
      </div>

    
      <div className="middle-row">
        <div className="donuts">{donuts}</div>
        <div className="heatmap">Heatmap Here</div>
        <div className="mini-kpis">
          <div className="mini-card">+115 Tasks</div>
          <div className="mini-card">+9% QoQ</div>
        </div>
      </div>

    
      <div className="summary-table-section">
        {table}
      </div>

    </div>
  );
};

export default ReportDashboard;
