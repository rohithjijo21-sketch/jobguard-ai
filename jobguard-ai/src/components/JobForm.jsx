import {
  FlaskConical,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Loader2,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";
import { fields, maxLength } from "../utils/validation";
const labels = {
  title: "Job title",
  company_profile: "Company profile",
  description: "Job description",
  requirements: "Requirements",
  benefits: "Benefits",
  employment_type: "Employment type",
  required_experience: "Required experience",
  required_education: "Required education",
  industry: "Industry",
  function: "Job function",
};
const options = {
  employment_type: ["Full-time", "Part-time", "Contract", "Temporary", "Other"],
  required_experience: [
    "Internship",
    "Entry level",
    "Associate",
    "Mid-Senior level",
    "Director",
    "Executive",
    "Not Applicable",
  ],
  required_education: [
    "High School or equivalent",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Unspecified",
  ],
};
const rows = {
  company_profile: 3,
  description: 5,
  requirements: 3,
  benefits: 2,
};
const placeholders = {
  title: "e.g. Senior Frontend Developer",
  company_profile: "What does the company do? Share its background…",
  description:
    "Paste the full job description here. Include responsibilities, compensation, and any recruitment instructions…",
  requirements: "Skills, qualifications, and experience…",
  benefits: "Compensation, perks, and benefits…",
  industry: "e.g. Information Technology",
  function: "e.g. Engineering",
};
export default function JobForm({
  job,
  errors,
  onChange,
  onSample,
  onClear,
  onSubmit,
  loading,
  onCancel,
}) {
  const completed = fields.filter((k) => job[k].trim()).length;
  function field(k) {
    const required = ["title", "description"].includes(k);
    const common = {
      id: k,
      name: k,
      required,
      value: job[k],
      onChange: (e) => onChange(k, e.target.value),
      "aria-invalid": !!errors[k],
      "aria-describedby": errors[k] ? k + "-error" : undefined,
      maxLength: maxLength(k),
    };
    return (
      <div
        key={k}
        className={"field " + (k === "required_education" ? "wide" : "")}
      >
        <label htmlFor={k}>
          {labels[k]}
          {required && <span className="required"> *</span>}
          {!required && <span className="optional">Optional</span>}
        </label>
        {options[k] ? (
          <select {...common}>
            <option value="">Select {labels[k].toLowerCase()}</option>
            {options[k].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : rows[k] ? (
          <textarea {...common} rows={rows[k]} placeholder={placeholders[k]} />
        ) : (
          <input {...common} placeholder={placeholders[k]} />
        )}{" "}
        {k === "description" && (
          <div className="field-note">
            <span>Include as much of the original posting as possible.</span>
            <span>{job[k].length.toLocaleString()} / 12,000</span>
          </div>
        )}
        {errors[k] && (
          <p className="field-error" id={k + "-error"}>
            {errors[k]}
          </p>
        )}
      </div>
    );
  }
  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">THE POSTING</span>
          <h2>Add the job details</h2>
          <p>Start with the title and description. Everything else is optional.</p>
        </div>
        <span className="step-badge">01</span>
      </div>
      <div className="toolbar">
        <span>Try an example</span>
        <button type="button" onClick={() => onSample("scam")}>
          <FlaskConical size={14} />
          Load Scam Sample
        </button>
        <button type="button" onClick={() => onSample("legit")}>
          <CheckCircle2 size={14} />
          Load Legit Sample
        </button>
        <button
          type="button"
          className="clear"
          onClick={onClear}
          aria-label="Clear Form"
        >
          <RotateCcw size={14} />
          Clear
        </button>
      </div>
      <form noValidate onSubmit={onSubmit} aria-busy={loading}>
        <div className="form-section">
          <h3>
            <span>01</span>Job overview
          </h3>
          {field("title")}
          {field("company_profile")}
        </div>
        <div className="form-section">
          <h3>
            <span>02</span>Job details
          </h3>
          {field("description")}
          {field("requirements")}
          {field("benefits")}
        </div>
        <div className="form-section">
          <h3>
            <span>03</span>Classification
          </h3>
          <div className="classification">{fields.slice(5).map(field)}</div>
        </div>
        <div className="submit-area">
          <div className="completion">
            <span>{completed} of 10 fields completed</span>
            <span>Only * fields are required</span>
          </div>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={19} />
            ) : (
              <ShieldCheck size={19} />
            )}{" "}
            {loading ? "Analyzing Posting..." : "Analyze Job Posting"}
            {!loading && <ChevronRight size={18} />}
          </button>
          {loading && (
            <button type="button" className="cancel" onClick={onCancel}>
              Cancel analysis
            </button>
          )}
          <p className="privacy">
            <LockKeyhole size={12} />
            Sent to your configured analysis server. Avoid including personal
            data.
          </p>
        </div>
      </form>
    </section>
  );
}
