import { useEffect } from "react"; // add to your existing react import

function PrivacyContent() {
  return (
    <div className="legal-container">
      <div className="eyebrow">YOUR PRIVACY MATTERS</div>
      <h2>Privacy <em>Policy</em></h2>
      <p className="legal-updated">Last updated: November 2026</p>

      {/* paste the rest of your Privacy Policy content here, unchanged
          (from the first <p> through the legal-contact div) */}
    </div>
  );
}

function TermsContent() {
  return (
    <div className="legal-container">
      <div className="eyebrow">WEBSITE TERMS OF USE</div>
      <h2>Terms &amp; <em>Conditions</em></h2>
      <p className="legal-updated">Last updated: November 2026</p>

      {/* paste the rest of your Terms & Conditions content here, unchanged */}
    </div>
  );
}

function LegalModal({ type, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="legal-close"
          onClick={onClose}
          aria-label="Close"
        >
          {/* <X size={20} /> */}
        </button>
        <div className="legal-modal-body">
          {type === "privacy" ? <PrivacyContent /> : <TermsContent />}
        </div>
      </div>
    </div>
  );
}

export default LegalModal