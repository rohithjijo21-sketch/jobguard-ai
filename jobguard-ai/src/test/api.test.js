import { describe, it, expect, vi } from "vitest";
import { analyzeJob } from "../services/api";
import { validateResult } from "../utils/resultValidation";
const good = {
  status: "Legitimate Job",
  is_fraudulent: false,
  ml_confidence: 99,
  rule_warnings: [],
};
describe("API boundaries", () => {
  it.each([400, 404, 429, 500])("handles HTTP %s", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
    await expect(analyzeJob({})).rejects.toThrow();
  });
  it("handles non JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw Error();
        },
      }),
    );
    await expect(analyzeJob({})).rejects.toThrow("not valid JSON");
  });
  it.each([
    null,
    { ...good, is_fraudulent: "false" },
    { ...good, ml_confidence: NaN },
    { ...good, rule_warnings: [1] },
  ])("rejects malformed payload %j", (data) => {
    expect(() => validateResult(data)).toThrow();
  });
  it("clamps confidence after validation and preserves original diagnostics", () => {
    const data = { ...good, ml_confidence: 120 };
    expect(validateResult(data).ml_confidence).toBe(100);
    expect(validateResult(data).rawResponse).toBe(data);
  });
  it("times out a stalled request", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (url, { signal }) =>
          new Promise((resolve, reject) =>
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            ),
          ),
      ),
    );
    const request = expect(analyzeJob({})).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(30000);
    await request;
    vi.useRealTimers();
  });
});
