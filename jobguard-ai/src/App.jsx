import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";
import Header from "./components/Header";
import JobForm from "./components/JobForm";
import AnalysisResult from "./components/AnalysisResult";
import Footer from "./components/Footer";
import { emptyJob, prepareJob, validateJob } from "./utils/validation";
import { scamJob, legitJob } from "./data/sampleJobs";
import { analyzeJob } from "./services/api";
function savedTheme() {
  try {
    return localStorage.getItem("jobguard-theme") || "light";
  } catch {
    return "light";
  }
}
export default function App() {
  const [job, setJob] = useState({ ...emptyJob }),
    [errors, setErrors] = useState({}),
    [state, setState] = useState("initial"),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [theme, setTheme] = useState(savedTheme);
  const request = useRef(null);
  const version = useRef(0);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("jobguard-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    return () => request.current?.abort();
  }, []);
  function invalidate() {
    version.current++;
    request.current?.abort();
    request.current = null;
    setError("");
    setState((s) => (s === "success" || s === "stale" ? "stale" : "initial"));
  }
  function change(k, v) {
    invalidate();
    setJob((j) => ({ ...j, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }
  function sample(type) {
    invalidate();
    setJob({ ...(type === "scam" ? scamJob : legitJob) });
    setResult(null);
    setState("initial");
    setErrors({});
    toast.success(
      `Fictional ${type === "scam" ? "suspicious" : "professional"} sample loaded. Classification is not guaranteed.`,
    );
  }
  function clear() {
    invalidate();
    setJob({ ...emptyJob });
    setErrors({});
    setResult(null);
    setState("initial");
    toast("Form cleared");
  }
  async function submit(e) {
    e?.preventDefault();
    if (request.current) return;
    const payload = prepareJob(job);
    const nextErrors = validateJob(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setJob(payload);
    const controller = new AbortController();
    request.current = controller;
    const token = ++version.current;
    setState("loading");
    setError("");
    try {
      const data = await analyzeJob(payload, {
        signal: controller.signal,
      });
      if (token !== version.current) return;
      setResult(data);
      setState("success");
    } catch (err) {
      if (token !== version.current) return;
      if (err.name === "AbortError") {
        setState("initial");
        return;
      }
      setError(err.message);
      setState("error");
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to workspace
      </a>
      <Header
        theme={theme}
        toggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <main id="main">
        <div className="page-heading">
          <div>
            <p className="page-kicker">A second look before your next step.</p>
            <h1>Good opportunities.<br/><em>Fewer unknowns.</em></h1>
          </div>
          <p className="page-intro">Look beyond the job title. Check a posting for suspicious language and recruitment red flags before you apply.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 workspace">
          <div className="lg:col-span-7">
            <JobForm
              job={job}
              errors={errors}
              onChange={change}
              onSample={sample}
              onClear={clear}
              onSubmit={submit}
              loading={state === "loading"}
              onCancel={() => {
                invalidate();
                setState("initial");
                toast("Analysis cancelled");
              }}
            />
          </div>
          <aside className="lg:col-span-5">
            <AnalysisResult
              state={state}
              result={result}
              error={error}
              onRetry={submit}
            />
            <section className="safety-tip" id="safety">
              <Info size={19} />
              <div>
                <h3>Before you share your details.</h3>
                <p>
                  Legitimate employers should not ask you to pay to get a job.
                  Verify the company and recruiter before sharing sensitive
                  information.
                </p>
              </div>
            </section>
          </aside>
        </div>
        <Footer />
      </main>
      <Toaster theme={theme} richColors position="bottom-right" />
    </>
  );
}
