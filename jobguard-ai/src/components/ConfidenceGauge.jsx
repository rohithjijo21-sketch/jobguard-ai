import { useEffect, useState } from "react";
export default function ConfidenceGauge({ value, fraud }) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <section className="result-section">
      <div className="confidence-title">
        <h3>Model Prediction Confidence</h3>
        <strong className={fraud ? "red" : "green"}>
          {value.toFixed(2)}
          <small>%</small>
        </strong>
      </div>
      <div
        className={"gauge " + (fraud ? "danger" : "safe")}
        role="progressbar"
        aria-label="Model Prediction Confidence"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <span style={{ width: fill + "%" }} />
      </div>
      <p className="fine-print">
        This percentage represents the model’s reported confidence in its
        classification, not an independently verified probability that the
        employer is fraudulent. Rules may override the model’s classification.
      </p>
    </section>
  );
}
