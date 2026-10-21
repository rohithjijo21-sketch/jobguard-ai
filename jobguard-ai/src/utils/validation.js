export const fields = [
  "title",
  "company_profile",
  "description",
  "requirements",
  "benefits",
  "employment_type",
  "required_experience",
  "required_education",
  "industry",
  "function",
];
export const emptyJob = Object.fromEntries(fields.map((k) => [k, ""]));
export const maxLength = (k) =>
  ["description", "requirements", "company_profile", "benefits"].includes(k)
    ? 12000
    : 200;
export function prepareJob(job) {
  return Object.fromEntries(
    fields.map((k) => [k, String(job[k] ?? "").trim()]),
  );
}
export function validateJob(job) {
  const errors = {};
  for (const k of fields) {
    if (["title", "description"].includes(k) && !job[k].trim())
      errors[k] = `Please enter a job ${k}.`;
    else if (job[k].length > maxLength(k))
      errors[k] = `Use ${maxLength(k)} characters or fewer.`;
  }
  return errors;
}
