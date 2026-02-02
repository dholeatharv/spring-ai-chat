// src/App.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ClipboardCopy,
  RefreshCcw,
} from "lucide-react";

type MatchRequest = {
  resumeText: string;
  jobDescription: string;
};

type MatchResponse = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  summary: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "bad" | "info";
}) {
  const toneCls = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bad: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-indigo-50 text-indigo-700 border-indigo-200",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneCls
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {subtitle ? (
            <div className="text-xs text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        <div className="ml-auto text-lg font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 10;
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  const tone =
    clamped >= 80 ? "stroke-emerald-500" : clamped >= 60 ? "stroke-amber-500" : "stroke-rose-500";
  const bg =
    clamped >= 80 ? "bg-emerald-50" : clamped >= 60 ? "bg-amber-50" : "bg-rose-50";
  const fgText =
    clamped >= 80 ? "text-emerald-700" : clamped >= 60 ? "text-amber-700" : "text-rose-700";

  return (
    <div className={cn("relative grid h-28 w-28 place-items-center rounded-2xl", bg)}>
      <svg width="120" height="120" className="absolute">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700", tone)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="text-center">
        <div className={cn("text-3xl font-extrabold", fgText)}>{clamped}</div>
        <div className="text-xs font-medium text-slate-500">Match</div>
      </div>
    </div>
  );
}

export default function App() {
  // Inputs
  const [resumeText, setResumeText] = useState<string>(
    "Skills: Java, Spring Boot, SQL, REST, AWS. Built microservices..."
  );
  const [jobDescription, setJobDescription] = useState<string>(
    "Looking for Java developer with Spring Boot, REST, SQL, Docker..."
  );

  // Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // Match
  const [matching, setMatching] = useState<boolean>(false);
  const [result, setResult] = useState<MatchResponse | null>(null);

  // Errors
  const [error, setError] = useState<string>("");

  const scoreTone = useMemo(() => {
    const s = result?.matchScore ?? 0;
    return s >= 80 ? "good" : s >= 60 ? "info" : "bad";
  }, [result]);

  // ✅ UPDATED URLS: using Vite proxy -> "/api/..."
  async function fetchHealth(): Promise<void> {
    setError("");
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`Health failed: ${res.status}`);
      const txt = await res.text();
      setUploadStatus(`Backend: ${txt}`);
    } catch (e: any) {
      setError(e?.message ?? "Health check failed");
    }
  }

  async function fetchMatch(): Promise<void> {
    setError("");
    setResult(null);
    setMatching(true);

    try {
      const payload: MatchRequest = { resumeText, jobDescription };

      const res = await fetch("/api/match", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Match failed (${res.status}). ${text}`.trim());
      }

      const data: MatchResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong while matching");
    } finally {
      setMatching(false);
    }
  }

  async function uploadResume(): Promise<void> {
    setError("");
    setUploadStatus("");
    if (!resumeFile) {
      setUploadStatus("Please choose a file first.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", resumeFile);

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Upload failed (${res.status}). ${text}`.trim());
      }

      const text = await res.text();
      setUploadStatus(text || `Uploaded: ${resumeFile.name}`);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function copyJSON() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setUploadStatus("Copied result JSON to clipboard.");
  }

  function reset() {
    setError("");
    setResult(null);
    setUploadStatus("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      {/* top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(closest-side,rgba(99,102,241,0.18),transparent)]" />
      <div className="pointer-events-none fixed inset-x-0 top-24 -z-10 h-64 bg-[radial-gradient(closest-side,rgba(16,185,129,0.14),transparent)]" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Job Matcher (Spring AI + Swagger + Vite)
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Resume ↔ Job Matching
              <span className="text-indigo-600"> that looks recruiter-ready</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Upload a resume (optional), paste resume text + job description, and get a structured
              match score with actionable gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchHealth}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Health
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Status / Error */}
        <div className="mt-5 space-y-3">
          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div className="text-sm">
                <div className="font-semibold">Something went wrong</div>
                <div className="mt-1 whitespace-pre-wrap">{error}</div>
                <div className="mt-2 text-xs text-rose-700">
                  Tip: if you see 429 quota errors, your OpenAI billing/quota for that API key is
                  exhausted.
                </div>
              </div>
            </div>
          ) : null}

          {uploadStatus ? (
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div className="text-sm whitespace-pre-wrap">{uploadStatus}</div>
            </div>
          ) : null}
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left: Inputs */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-700" />
                <h2 className="text-base font-bold">Inputs</h2>
              </div>
              <Pill tone="neutral">Phase 1</Pill>
            </div>

            {/* Upload */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Upload className="h-4 w-4 text-indigo-600" />
                    Upload resume (optional)
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Backend endpoint: <span className="font-mono">POST /api/upload-resume</span>
                  </div>
                </div>
                <Pill tone="info">5MB</Pill>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
                <button
                  onClick={uploadResume}
                  disabled={uploading}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
                    uploading
                      ? "bg-slate-200 text-slate-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* Textareas */}
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-slate-700" />
                  Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-indigo-600/20 focus:ring-4"
                  placeholder="Paste resume text here..."
                />
                <div className="mt-2 text-xs text-slate-500">
                  Tip: Later we’ll auto-fill this from the uploaded resume.
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Briefcase className="h-4 w-4 text-slate-700" />
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-indigo-600/20 focus:ring-4"
                  placeholder="Paste job description here..."
                />
              </div>
            </div>

            {/* Match CTA */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Endpoint: <span className="font-mono">POST /api/match</span>
              </div>
              <button
                onClick={fetchMatch}
                disabled={matching}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition",
                  matching
                    ? "bg-slate-200 text-slate-600"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {matching ? "Matching..." : "Run Match"}
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold">Result</h2>
              </div>
              {result ? (
                <div className="flex items-center gap-2">
                  <Pill tone={scoreTone === "good" ? "good" : scoreTone === "info" ? "info" : "bad"}>
                    Score {result.matchScore}
                  </Pill>
                  <button
                    onClick={copyJSON}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy JSON
                  </button>
                </div>
              ) : (
                <Pill tone="neutral">Awaiting match</Pill>
              )}
            </div>

            {!result ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Run a match to see insights
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      You’ll get a score, matched skills, missing skills, recommendations, and a summary.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-5 space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <ScoreRing score={result.matchScore} />
                  </div>
                  <div className="sm:col-span-2 grid gap-3">
                    <StatCard
                      title="Matched skills"
                      subtitle="What you already have"
                      value={result.matchedSkills.length}
                      icon={<CheckCircle2 className="h-5 w-5" />}
                    />
                    <StatCard
                      title="Missing skills"
                      subtitle="What to focus next"
                      value={result.missingSkills.length}
                      icon={<AlertTriangle className="h-5 w-5" />}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-800">Summary</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-800">Matched Skills</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.matchedSkills.map((s) => (
                        <Pill key={s} tone="good">
                          {s}
                        </Pill>
                      ))}
                      {result.matchedSkills.length === 0 ? (
                        <div className="text-sm text-slate-500">No matches found.</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-800">Missing Skills</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.missingSkills.map((s) => (
                        <Pill key={s} tone="bad">
                          {s}
                        </Pill>
                      ))}
                      {result.missingSkills.length === 0 ? (
                        <div className="text-sm text-slate-500">Nothing missing 🎉</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-800">Recommendations</div>
                  <ul className="mt-3 space-y-2">
                    {result.recommendations.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-600" />
                        <span>{r}</span>
                      </li>
                    ))}
                    {result.recommendations.length === 0 ? (
                      <div className="text-sm text-slate-500">No recommendations.</div>
                    ) : null}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-slate-500">
          UI calls backend via <span className="font-mono">/api/*</span>. Make sure Vite proxy is configured to
          forward <span className="font-mono">/api</span> to <span className="font-mono">http://localhost:8080</span>.
        </div>
      </div>
    </div>
  );
}
