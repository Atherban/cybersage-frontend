// TestCertificate.jsx
import CertificateDownload from "../molecules/CertificateDownload";

export default function TestCertificate() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Test Certificate</h2>

      <CertificateDownload
        userName="Test User"
        moduleName="Digital Arrest"
        score={85}
        date={new Date().toLocaleDateString()}
      />

      <p>Click the button above. You should receive a PDF download.</p>
    </div>
  );
}
