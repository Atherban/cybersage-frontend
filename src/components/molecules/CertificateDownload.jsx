// CertificateDownload.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Certificate from "../atoms/Certificate";

const CertificateDownload = ({ userName, moduleName, score }) => {
  const certRef = useRef(null);

  const downloadPDF = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const image = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "px", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    pdf.addImage(image, "PNG", 0, 0, width, height);
    pdf.save(`CyberSage-${moduleName}-certificate.pdf`);
  };

  return (
    <div>
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={certRef}>
          <Certificate
            userName={userName}
            moduleName={moduleName}
            score={score}
            date={new Date().toLocaleDateString()}
          />
        </div>
      </div>

      <button onClick={downloadPDF} className="certificate-btn">
        📜 Download Certificate
      </button>
    </div>
  );
};

export default CertificateDownload;
