import { ArrowUpRight } from "lucide-react";
export default function SafetyRecommendations({ fraud }) {
  const actions = fraud
    ? [
        "Do not send registration or recruitment fees.",
        "Verify the employer using an independently located official website.",
        "Avoid sharing identity documents before verifying the recruitment process.",
        "Confirm recruiter contact details using official company channels.",
        "Report suspicious listings to the relevant platform.",
      ]
    : [
        "Verify the employer through its official website.",
        "Confirm recruiter details using official company channels.",
        "Review the recruitment process before sharing sensitive information.",
      ];
  return (
    <section className="result-section">
      <h3>Recommended Safety Actions</h3>
      <p className="muted">
        General safety recommendations, not additional model findings.
      </p>
      <ul className="actions">
        {actions.map((a) => (
          <li key={a}>
            <ArrowUpRight size={15} />
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}
