import React from "react";
import "./Loading.scss";

const Loading: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="styled-wrapper">
        <div className="spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
};

export default Loading;
