// components/Certificate.jsx
import React from "react";
import "./Certificate.css";

const Certificate = ({ userName, moduleName, score, date }) => {
  return (
    <div className="certificate-wrapper">
      <div className="certificate-border">
        <h1 className="title">Certificate of Completion</h1>

        <p>This certifies that</p>

        <h2 className="username">{userName}</h2>

        <p>has successfully completed</p>

        <h3 className="module">{moduleName}</h3>

        <p>
          with a score of <strong>{score}%</strong>
        </p>

        <p className="date">Date: {date}</p>

        <div className="signatures">
          <div>
            <div className="line"></div>
            <span>Instructor</span>
          </div>

          <div>
            <div className="line"></div>
            <span>CyberSage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
