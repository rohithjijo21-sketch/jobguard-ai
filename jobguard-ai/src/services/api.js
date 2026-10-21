import { validateResult } from "../utils/resultValidation";
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");
// No health route exists in the inspected Flask backend. Never probe with dummy postings.
export async function checkConnectivity() {
  return "Unverified";
}
export async function analyzeJob(payload, { signal, onReachable } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 30000);
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    onReachable?.();
    if (!res.ok) {
      const messages = {
        400: "The server could not accept these job details. Review the fields and try again.",
        404: "The analysis endpoint was not found. Check the configured API URL.",
        429: "The service is receiving too many requests. Wait a moment before retrying.",
      };
      throw new Error(
        messages[res.status] ||
          (res.status >= 500
            ? "The analysis server encountered an error. Please try again shortly."
            : `The request could not be completed (HTTP ${res.status}).`),
      );
    }
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(
        "The server returned a response that is not valid JSON. Contact the service administrator.",
      );
    }
    return validateResult(data);
  } catch (error) {
    if (timedOut)
      throw new Error("Analysis timed out after 30 seconds. Please try again.");
    if (error.name === "AbortError") throw error;
    if (error instanceof TypeError) {
      const e = new Error(
        "The analysis service could not be reached. Check that Flask is running, the API URL is correct, and CORS allows this frontend.",
      );
      e.network = true;
      throw e;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
