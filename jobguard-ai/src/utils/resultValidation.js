export function validateResult(data) {
  if (
    !data ||
    typeof data.status !== "string" ||
    typeof data.is_fraudulent !== "boolean" ||
    typeof data.ml_confidence !== "number" ||
    !Number.isFinite(data.ml_confidence) ||
    !Array.isArray(data.rule_warnings) ||
    !data.rule_warnings.every((w) => typeof w === "string")
  )
    throw new Error(
      "The server returned an invalid analysis. Please retry or contact the service administrator.",
    );
  return {
    ...data,
    rawResponse: data,
    ml_confidence: Math.min(100, Math.max(0, data.ml_confidence)),
  };
}
