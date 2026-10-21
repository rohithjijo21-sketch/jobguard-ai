import {
  FileSearch,
  ScanLine,
  BrainCircuit,
  ListChecks,
  AlertCircle,
  RotateCcw,
  History,
} from "lucide-react";
import VerdictCard from "./VerdictCard";
import ConfidenceGauge from "./ConfidenceGauge";
import ThreatWarnings from "./ThreatWarnings";
import SafetyRecommendations from "./SafetyRecommendations";
import LoadingSkeleton from "./LoadingSkeleton";
export default function AnalysisResult({ state, result, error, onRetry }) {
  return (
    <section
      className="panel analysis-panel"
      aria-label="Analysis results"
      aria-live="polite"
    >
      <div className="analysis-heading">
        <span>
          Analysis
        </span>
        <span className="live-label">
          {state === "success"
            ? "COMPLETE"
            : state === "loading"
              ? "ANALYZING"
              : "NOT ANALYZED"}
        </span>
      </div>
      {state === "loading" ? (
        <LoadingSkeleton />
      ) : state === "error" ? (
        <div className="empty error-state" role="alert">
          <AlertCircle size={42} />
          <h2>Unable to complete analysis</h2>
          <p>{error}</p>
          <button className="secondary" onClick={onRetry}>
            <RotateCcw size={15} />
            Retry analysis
          </button>
        </div>
      ) : state === "stale" ? (
        <div className="empty">
          <History size={42} />
          <h2>Posting has changed</h2>
          <p>
            The previous assessment is outdated. Analyze the updated posting to
            get a current result.
          </p>
          <button className="secondary" onClick={onRetry}>
            Analyze updated posting
          </button>
        </div>
      ) : state === "success" ? (
        <div className="result-content">
          <VerdictCard result={result} />
          <ConfidenceGauge
            value={result.ml_confidence}
            fraud={result.is_fraudulent}
          />
          <ThreatWarnings warnings={result.rule_warnings} />
          <SafetyRecommendations fraud={result.is_fraudulent} />
        </div>
      ) : (
        <>
          <div className="empty">
            <div className="empty-icon"><FileSearch size={30} strokeWidth={1.3}/></div>
            <h2>Ready to Inspect</h2>
            <p>
              Submit a job posting to scan for suspicious language, potential
              fraud indicators, and machine learning risk signals.
            </p>
            <span className="awaiting">
              <i />
              Waiting for a job posting
            </span>
          </div>
          <div className="scan-features">
            <div><b>01</b><p>Add the original posting details.</p></div>
            <div><b>02</b><p>Run a model and rule-based assessment.</p></div>
            <div><b>03</b><p>Review the signals and decide what’s next.</p></div>
          </div>
          <div className="analysis-note">
            An assessment, not a background check. Always verify the employer.
          </div>
        </>
      )}
    </section>
  );
}
