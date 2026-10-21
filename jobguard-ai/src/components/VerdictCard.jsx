import { ShieldAlert, ShieldCheck } from "lucide-react";
export default function VerdictCard({ result }) {
  const fraud = result.is_fraudulent;
  const consistent = fraud
    ? !/legitimate|safe/i.test(result.status)
    : !/scam|fraud|high.?risk/i.test(result.status);
  const Icon = fraud ? ShieldAlert : ShieldCheck;
  return (
    <div className={"verdict " + (fraud ? "danger" : "safe")}>
      <Icon size={36} />
      <span className="eyebrow">ANALYSIS COMPLETE</span>
      <h3>
        {fraud
          ? "High-Risk Posting Detected"
          : "No High-Risk Classification Detected"}
      </h3>
      <p>
        {fraud
          ? "This job advertisement shows indicators associated with fraudulent recruitment activity. Proceed with caution and independently verify the employer."
          : "The analysis did not classify this posting as fraudulent. This does not verify the employer or guarantee that the opportunity is legitimate."}
      </p>
      {!fraud && <b>Legitimate Opportunity</b>}
      {consistent && <small>{result.status}</small>}
    </div>
  );
}
