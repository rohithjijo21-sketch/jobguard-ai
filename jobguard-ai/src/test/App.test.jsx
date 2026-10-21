import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App";
import { fields } from "../utils/validation";
const fraud = {
  status: "High-Risk Scam",
  is_fraudulent: true,
  ml_confidence: 92.45,
  rule_warnings: ["Financial warning", "Contact warning"],
};
const legit = {
  status: "Legitimate Job",
  is_fraudulent: false,
  ml_confidence: 96.18,
  rule_warnings: [],
};
function mock(data = fraud) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => data }),
  );
}
function sample(type = "Scam") {
  fireEvent.click(screen.getByRole("button", { name: `Load ${type} Sample` }));
}
function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Analyze Job Posting" }));
}
describe("workspace", () => {
  it("starts ready with all ten fields and unverified connection", () => {
    render(<App />);
    expect(screen.getByText("Ready to Inspect")).toBeInTheDocument();
    expect(document.querySelectorAll("input,textarea,select")).toHaveLength(10);
    expect(screen.getByText("Unverified")).toBeInTheDocument();
  });
  it("validates empty and whitespace required values", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "  " },
    });
    submit();
    expect(screen.getByText("Please enter a job title.")).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a job description."),
    ).toBeInTheDocument();
  });
  it.each(["Scam", "Legit"])(
    "loads all fields of the fictional %s sample",
    (type) => {
      render(<App />);
      sample(type);
      for (const k of fields)
        expect(document.getElementById(k).value).not.toBe("");
      expect(screen.getByLabelText(/Job title/).value).toContain(
        "fictional sample",
      );
    },
  );
  it("clears form and validation", () => {
    render(<App />);
    submit();
    sample();
    fireEvent.click(screen.getByRole("button", { name: "Clear Form" }));
    for (const k of fields) expect(document.getElementById(k).value).toBe("");
    expect(
      screen.queryByText("Please enter a job title."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Ready to Inspect")).toBeInTheDocument();
  });
  it("submits exactly ten trimmed keys, renders fraud, confidence, and every warning", async () => {
    mock();
    render(<App />);
    sample();
    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "  Example  " },
    });
    submit();
    expect(
      await screen.findByText("High-Risk Posting Detected"),
    ).toBeInTheDocument();
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(Object.keys(payload)).toEqual(fields);
    expect(payload.title).toBe("Example");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "92.45",
    );
    expect(screen.getByText("92.45")).toBeInTheDocument();
    for (const w of fraud.rule_warnings)
      expect(screen.getByText(w)).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });
  it("renders legitimate prediction and empty warning state", async () => {
    mock(legit);
    render(<App />);
    sample("Legit");
    submit();
    expect(
      await screen.findByText("No High-Risk Classification Detected"),
    ).toBeInTheDocument();
    expect(screen.getByText("Legitimate Opportunity")).toBeInTheDocument();
    expect(
      screen.getByText("No Heuristic Triggers Matched"),
    ).toBeInTheDocument();
  });
  it("shows loading and prevents duplicate submissions", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<App />);
    sample();
    submit();
    expect(screen.getByText("Running Security Analysis")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /Analyzing Posting/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("handles network failure with retry using current content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    render(<App />);
    sample();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be reached",
    );
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    fetch.mockResolvedValue({ ok: true, json: async () => legit });
    fireEvent.click(screen.getByRole("button", { name: "Retry analysis" }));
    expect(
      await screen.findByText("Legitimate Opportunity"),
    ).toBeInTheDocument();
  });
  it("handles malformed responses without a safe verdict", async () => {
    mock({ status: "ok" });
    render(<App />);
    sample();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "invalid analysis",
    );
    expect(
      screen.queryByText("Legitimate Opportunity"),
    ).not.toBeInTheDocument();
  });
  it("marks edited results outdated", async () => {
    mock();
    render(<App />);
    sample();
    submit();
    await screen.findByText("High-Risk Posting Detected");
    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "New posting" },
    });
    expect(screen.getByText("Posting has changed")).toBeInTheDocument();
    expect(
      screen.queryByText("High-Risk Posting Detected"),
    ).not.toBeInTheDocument();
  });
  it("ignores a delayed response after edits", async () => {
    let resolve;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise((r) => (resolve = r))),
    );
    render(<App />);
    sample();
    submit();
    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "New" },
    });
    resolve({ ok: true, json: async () => fraud });
    await waitFor(() =>
      expect(screen.getByText("Ready to Inspect")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText("High-Risk Posting Detected"),
    ).not.toBeInTheDocument();
  });
  it("cancels an in-flight request", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<App />);
    sample();
    submit();
    fireEvent.click(screen.getByRole("button", { name: "Cancel analysis" }));
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(screen.getByText("Ready to Inspect")).toBeInTheDocument();
  });
  it("preserves theme while resetting the form", () => {
    render(<App />);
    const before = document.documentElement.dataset.theme;
    fireEvent.click(screen.getByRole("button", { name: /Switch to/ }));
    const after = document.documentElement.dataset.theme;
    expect(after).not.toBe(before);
    fireEvent.click(screen.getByRole("button", { name: "Clear Form" }));
    expect(document.documentElement.dataset.theme).toBe(after);
  });
});
