"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { JDInput } from "@/components/JDInput";
import { MockModeBanner } from "@/components/MockModeBanner";
import { ResumeInput } from "@/components/ResumeInput";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { apiAnalyze, ApiError } from "@/lib/api-client";
import { sampleJdText } from "@/lib/mocks/sample-jd";
import { sampleResumeText } from "@/lib/mocks/sample-resume";
import {
  loadDraft,
  saveDraft,
  saveRun,
  saveRunMockFlag,
} from "@/lib/session";

function TailorInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeError, setResumeError] = useState<string>();
  const [jdError, setJdError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>();
  const [llmConfigured, setLlmConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d: { llmConfigured: boolean }) => setLlmConfigured(d.llmConfigured))
      .catch(() => setLlmConfigured(false));
  }, []);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setResumeText(draft.resumeText);
      setJdText(draft.jdText);
    }
    if (searchParams.get("sample") === "1") {
      setResumeText(sampleResumeText);
      setJdText(sampleJdText);
    }
  }, [searchParams]);

  const persistDraft = useCallback((resume: string, jd: string) => {
    saveDraft({ resumeText: resume, jdText: jd });
  }, []);

  const validate = () => {
    let ok = true;
    if (!resumeText.trim()) {
      setResumeError("Resume is required.");
      ok = false;
    } else setResumeError(undefined);

    if (!jdText.trim()) {
      setJdError("Job description is required.");
      ok = false;
    } else setJdError(undefined);

    return ok;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setApiError(undefined);
    setSubmitting(true);
    persistDraft(resumeText, jdText);

    try {
      const { run, usedMock } = await apiAnalyze(resumeText, jdText);
      saveRun(run);
      saveRunMockFlag(run.id, usedMock);
      router.push("/tailor/results");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Analysis failed. Check your connection and try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadSample = () => {
    setResumeText(sampleResumeText);
    setJdText(sampleJdText);
    setResumeError(undefined);
    setJdError(undefined);
    persistDraft(sampleResumeText, sampleJdText);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resume & job description</h1>
        <p className="text-muted-foreground">
          Paste plain text for both fields. Analysis runs via the LLM API when configured.
        </p>
      </div>

      <StepIndicator current="input" />

      {llmConfigured === false && <MockModeBanner />}

      {apiError && (
        <ErrorBanner message={apiError} onDismiss={() => setApiError(undefined)} />
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={loadSample}>
          Load sample resume & JD
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResumeInput
          value={resumeText}
          onChange={(v) => {
            setResumeText(v);
            persistDraft(v, jdText);
          }}
          error={resumeError}
        />
        <JDInput
          value={jdText}
          onChange={(v) => {
            setJdText(v);
            persistDraft(resumeText, v);
          }}
          error={jdError}
        />
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handleAnalyze}
        disabled={submitting}
      >
        {submitting ? "Analyzing…" : "Analyze"}
      </Button>
    </div>
  );
}

export default function TailorPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <TailorInputContent />
    </Suspense>
  );
}
