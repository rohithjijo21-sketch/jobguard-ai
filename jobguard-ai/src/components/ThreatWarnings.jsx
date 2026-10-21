import { AlertTriangle, CheckCircle2 } from "lucide-react";
export default function ThreatWarnings({ warnings }) {
  return (
    <section className="result-section">
      <div className="section-heading">
        <h3>Heuristic Security Alerts</h3>
        <span className="count">{warnings.length}</span>
      </div>
      <p className="muted">
        Rule-based indicators detected in the submitted job posting.
      </p>
      <div className="warnings">
        {warnings.length ? (
          warnings.map((w, i) => (
            <div className="warning" key={i}>
              <AlertTriangle size={18} />
              <span>{w}</span>
            </div>
          ))
        ) : (
          <div className="no-warnings">
            <CheckCircle2 size={20} />
            <div>
              <b>No Heuristic Triggers Matched</b>
              <p>
                The rule-based scanner did not return any warning indicators.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
