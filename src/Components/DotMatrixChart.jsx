import React from "react";

const DotMatrixChart = ({ categories, values }) => {
  return (
    <div className="dot-matrix-container">
      {categories.map((cat, i) => (
        <div key={cat} className="dot-row">
          <div className="dot-label">{cat}</div>

          <div className="dot-row-dots">
            {Array.from({ length: 20 }).map((_, idx) => (
              <span
                key={idx}
                className={
                  idx < Math.round((values[i] || 0) / 5)
                    ? "dot active"
                    : "dot inactive"
                }
              />
            ))}
          </div>

          <div className="dot-value">{values[i]}%</div>
        </div>
      ))}
    </div>
  );
};

export default DotMatrixChart;
