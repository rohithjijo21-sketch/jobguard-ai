import { Loader2 } from "lucide-react";
export default function LoadingSkeleton() {
  return (
    <div className="loading" role="status">
      <div className="scan-orbit">
        <Loader2 size={36} className="spin" />
      </div>
      <h3>Running Security Analysis</h3>
      <p>Evaluating job details and checking for suspicious patterns.</p>
      <div className="skeleton tall" />
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton short" />
    </div>
  );
}
