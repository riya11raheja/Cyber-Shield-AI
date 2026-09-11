import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  Download,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Lock,
  MessageSquareWarning,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ---------------------------------------
   Risk configuration
--------------------------------------- */

const getRiskConfig = (riskLevel, riskScore) => {
  const level = String(riskLevel || "").toUpperCase();

  if (level === "CRITICAL" || riskScore >= 80) {
    return {
      label: "CRITICAL RISK",
      icon: ShieldAlert,
      wrapper:
        "border-red-200 bg-red-50 text-red-700",
      badge:
        "border-red-200 bg-red-100 text-red-700",
    };
  }

  if (level === "HIGH" || riskScore >= 60) {
    return {
      label: "HIGH RISK",
      icon: ShieldAlert,
      wrapper:
        "border-orange-200 bg-orange-50 text-orange-700",
      badge:
        "border-orange-200 bg-orange-100 text-orange-700",
    };
  }

  if (level === "MEDIUM" || riskScore >= 30) {
    return {
      label: "MEDIUM RISK",
      icon: AlertTriangle,
      wrapper:
        "border-yellow-200 bg-yellow-50 text-yellow-700",
      badge:
        "border-yellow-200 bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "LOW RISK",
    icon: ShieldCheck,
    wrapper:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    badge:
      "border-emerald-200 bg-emerald-100 text-emerald-700",
  };
};

/* ---------------------------------------
   Date formatter
--------------------------------------- */

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "Just now";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =======================================
   MAIN COMPONENT
======================================= */

export default function ScreenshotAnalyzer() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [evidence, setEvidence] = useState(null);

  const [error, setError] = useState("");

  const [guardianAlerted, setGuardianAlerted] =
    useState(false);

  const [isGuardianAlerting, setIsGuardianAlerting] =
    useState(false);

  /* ---------------------------------------
     Cleanup preview URL
  --------------------------------------- */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ---------------------------------------
     Select File
  --------------------------------------- */

  const handleFileSelect = (file) => {
    setError("");
    setAnalysis(null);
    setEvidence(null);
    setGuardianAlerted(false);

    if (!file) {
      return;
    }

    /* Image validation */
    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload a valid image file such as PNG, JPG or WEBP."
      );
      return;
    }

    /* Size validation */
    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Screenshot size must be less than 10 MB."
      );
      return;
    }

    /* Remove old preview */
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  };

  /* ---------------------------------------
     File input
  --------------------------------------- */

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }

    event.target.value = "";
  };

  /* ---------------------------------------
     Drag & Drop
  --------------------------------------- */

  const handleDrop = (event) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /* ---------------------------------------
     Remove screenshot
  --------------------------------------- */

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setAnalysis(null);
    setEvidence(null);
    setError("");
    setGuardianAlerted(false);
  };

  /* =======================================
     ANALYZE SCREENSHOT
     
     IMPORTANT:
     NO LOGIN
     NO TOKEN
     NO USER ID
  ======================================= */

  const analyzeScreenshot = async () => {
    if (!selectedFile) {
      setError(
        "Please upload a screenshot before starting the analysis."
      );
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);
    setEvidence(null);
    setGuardianAlerted(false);

    try {
      /* -----------------------------------
         Create multipart form
      ----------------------------------- */

      const formData = new FormData();

      formData.append(
        "screenshot",
        selectedFile
      );

      /* -----------------------------------
         Backend request
         
         NO Authorization header
         NO user ID
      ----------------------------------- */

      const response = await fetch(
        `${API_BASE_URL}/api/screenshot/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      /* -----------------------------------
         Read response
      ----------------------------------- */

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      /* -----------------------------------
         Handle backend errors
      ----------------------------------- */

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Screenshot analysis failed."
        );
      }

      /* -----------------------------------
         Save result
      ----------------------------------- */

      setAnalysis(data.analysis || null);
      setEvidence(data.evidence || null);
    } catch (err) {
      console.error(
        "Screenshot analysis error:",
        err
      );

      setError(
        err?.message ||
          "Unable to analyze screenshot. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* =======================================
     INCIDENT REPORT
  ======================================= */

  const downloadIncidentReport = () => {
    if (!analysis) {
      return;
    }

    const reportId =
      evidence?.id ||
      `CS-${Date.now()
        .toString()
        .slice(-6)}`;

    const reportDate = formatDateTime(
      evidence?.createdAt || new Date()
    );

    const signals = Array.isArray(
      analysis.signals
    )
      ? analysis.signals
      : [];

    const report = `
==================================================
              CYBER SHIELD AI
        SCREENSHOT SECURITY REPORT
==================================================

Evidence ID:
${reportId}

Analysis Date:
${reportDate}

Original File:
${selectedFile?.name || "Unknown"}

==================================================
RISK ASSESSMENT
==================================================

Risk Score:
${analysis.riskScore ?? 0}/100

Risk Level:
${analysis.riskLevel || "UNKNOWN"}

==================================================
SECURITY SIGNALS
==================================================

${
  signals.length > 0
    ? signals
        .map(
          (signal, index) =>
            `${index + 1}. ${signal}`
        )
        .join("\n")
    : "No specific suspicious signals detected."
}

==================================================
SUSPICIOUS TEXT
==================================================

${
  analysis.suspiciousText ||
  "No suspicious text identified."
}

==================================================
AI EXPLANATION
==================================================

${
  analysis.explanation ||
  "No additional explanation provided."
}

==================================================
RECOMMENDATION
==================================================

${
  analysis.recommendation ||
  "Avoid clicking suspicious links and never share OTPs, passwords, PINs or banking credentials."
}

==================================================
STATUS
==================================================

${evidence?.status || "ANALYZED"}

==================================================
Generated by Cyber Shield AI
==================================================
`;

    const blob = new Blob(
      [report],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `${reportId}-incident-report.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================
     GUARDIAN ALERT
     
     UI action for hackathon.
     No login required.
  ======================================= */

  const alertGuardian = async () => {
    if (!analysis) {
      return;
    }

    setIsGuardianAlerting(true);
    setError("");

    try {
      /*
       * Currently this is a frontend demo action.
       *
       * When your Guardian Alert backend endpoint
       * is ready, the API call can be added here.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      setGuardianAlerted(true);
    } catch (err) {
      console.error(
        "Guardian alert error:",
        err
      );

      setError(
        "Unable to alert guardian. Please try again."
      );
    } finally {
      setIsGuardianAlerting(false);
    }
  };

  /* =======================================
     RESET
  ======================================= */

  const resetAnalyzer = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setAnalysis(null);
    setEvidence(null);
    setError("");
    setGuardianAlerted(false);
    setIsAnalyzing(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ---------------------------------------
     Risk values
  --------------------------------------- */

  const riskScore = Number(
    analysis?.riskScore || 0
  );

  const riskConfig = getRiskConfig(
    analysis?.riskLevel,
    riskScore
  );

  const RiskIcon = riskConfig.icon;

  const hasAnalysis =
    Boolean(analysis);

  /* =======================================
     UI
  ======================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-8">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Screenshot Analyzer
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Detect phishing, scams and
                social-engineering threats using
                Cyber Shield AI.
              </p>
            </div>

          </div>

          {/* Feature badges */}

          <div className="flex flex-wrap gap-2">

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <Lock className="h-3.5 w-3.5" />
              Secure AI Analysis
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <Bot className="h-3.5 w-3.5" />
              Gemini AI
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <FileImage className="h-3.5 w-3.5" />
              Image Analysis
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              No Login Required
            </span>

          </div>
        </div>

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">

            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">

              <p className="font-semibold">
                Analysis Error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =================================
            MAIN GRID
        ================================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* =================================
              LEFT PANEL
          ================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Screenshot
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload a suspicious message,
                  payment screen, link or account
                  alert.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <ImageIcon className="h-5 w-5 text-slate-700" />
              </div>

            </div>

            {/* =================================
                UPLOAD AREA
            ================================= */}

            {!selectedFile ? (

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-slate-500 hover:bg-slate-100 sm:p-12"
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
                  <Upload className="h-7 w-7 text-slate-700" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Drop screenshot here
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  or click to browse from your device
                </p>

                <div className="mt-5 flex justify-center gap-2">

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    PNG
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    JPG
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    WEBP
                  </span>

                </div>

                <p className="mt-5 text-xs text-slate-400">
                  Maximum file size: 10 MB
                </p>

              </div>

            ) : (

              /* =================================
                 IMAGE PREVIEW
              ================================= */

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">

                <div className="relative flex min-h-[300px] items-center justify-center bg-slate-900 p-3 sm:min-h-[420px]">

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Uploaded screenshot preview"
                      className="max-h-[520px] max-w-full rounded-xl object-contain shadow-2xl"
                    />
                  )}

                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

                {/* File information */}

                <div className="p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200">
                      <FileImage className="h-5 w-5 text-slate-700" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB •{" "}
                        {selectedFile.type ||
                          "Image"}
                      </p>

                    </div>

                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                  </div>

                </div>

              </div>
            )}

            {/* =================================
                ANALYZE BUTTON
            ================================= */}

            <button
              type="button"
              onClick={analyzeScreenshot}
              disabled={
                !selectedFile ||
                isAnalyzing
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Analyze with Cyber Shield AI
                </>
              )}

            </button>

            {/* =================================
                LOADING STATUS
            ================================= */}

            {isAnalyzing && (

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Bot className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-slate-800">
                      Cyber Shield AI is checking
                      the screenshot
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Checking phishing, OTP
                      requests, impersonation,
                      payment scams and suspicious
                      links.
                    </p>

                  </div>

                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />

                </div>

              </div>
            )}

          </section>

          {/* =================================
              RIGHT PANEL
          ================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            {/* =================================
                EMPTY STATE
            ================================= */}

            {!hasAnalysis ? (

              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">

                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
                  <Shield className="h-9 w-9 text-slate-500" />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Security Analysis
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Upload a screenshot and run the
                  AI analysis to see the detected
                  risk, suspicious signals and
                  recommended actions.
                </p>

                <div className="mt-7 grid w-full max-w-md gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">

                    <MessageSquareWarning className="mb-3 h-5 w-5 text-slate-700" />

                    <p className="text-sm font-semibold text-slate-800">
                      Scam Detection
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Detect phishing and
                      social-engineering patterns.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">

                    <ShieldCheck className="mb-3 h-5 w-5 text-slate-700" />

                    <p className="text-sm font-semibold text-slate-800">
                      Safety Guidance
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Get AI-powered recommendations
                      before taking action.
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              /* =================================
                 ANALYSIS RESULT
              ================================= */

              <div>

                {/* Result heading */}

                <div className="mb-5 flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Bot className="h-5 w-5" />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        AI Analysis
                      </p>

                      <h2 className="text-lg font-bold text-slate-900">
                        Security Result
                      </h2>

                    </div>

                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${riskConfig.badge}`}
                  >
                    <RiskIcon className="h-3.5 w-3.5" />
                    {riskConfig.label}
                  </span>

                </div>

                {/* =================================
                    RISK SCORE
                ================================= */}

                <div
                  className={`rounded-3xl border p-5 ${riskConfig.wrapper}`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold opacity-80">
                        Threat Risk Score
                      </p>

                      <div className="mt-2 flex items-end gap-2">

                        <span className="text-5xl font-black tracking-tight">
                          {riskScore}
                        </span>

                        <span className="mb-1 text-sm font-semibold opacity-70">
                          /100
                        </span>

                      </div>

                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70">
                      <RiskIcon className="h-8 w-8" />
                    </div>

                  </div>

                  {/* Progress bar */}

                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-black/10">

                    <div
                      className="h-full rounded-full bg-current transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            riskScore
                          )
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="mt-3 text-xs font-medium opacity-75">

                    {riskScore >= 80
                      ? "Immediate caution recommended. Avoid interacting with the content."
                      : riskScore >= 60
                      ? "Potentially dangerous content detected. Verify before taking action."
                      : riskScore >= 30
                      ? "Some suspicious indicators were detected. Stay cautious."
                      : "No major threat indicators were detected."}

                  </p>

                </div>

                {/* =================================
                    EVIDENCE INFORMATION
                ================================= */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-500">

                      <Shield className="h-4 w-4" />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Evidence ID
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {evidence?.id ||
                        "Generated"}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-500">

                      <Clock3 className="h-4 w-4" />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Analyzed
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {formatDateTime(
                        evidence?.createdAt
                      )}
                    </p>

                  </div>

                </div>

                {/* =================================
                    SECURITY SIGNALS
                ================================= */}

                <div className="mt-5">

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="text-sm font-bold text-slate-900">
                      Security Signals
                    </h3>

                    <span className="text-xs text-slate-400">
                      {Array.isArray(
                        analysis.signals
                      )
                        ? analysis.signals.length
                        : 0}{" "}
                      detected
                    </span>

                  </div>

                  {Array.isArray(
                    analysis.signals
                  ) &&
                  analysis.signals.length > 0 ? (

                    <div className="space-y-2">

                      {analysis.signals.map(
                        (signal, index) => (

                          <div
                            key={`${signal}-${index}`}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                          >

                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                              {index + 1}
                            </div>

                            <p className="text-sm leading-6 text-slate-700">
                              {signal}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                      <div className="flex items-center gap-2 text-emerald-700">

                        <CheckCircle2 className="h-5 w-5" />

                        <p className="text-sm font-semibold">
                          No specific suspicious
                          signals detected.
                        </p>

                      </div>

                    </div>
                  )}

                </div>

                {/* =================================
                    SUSPICIOUS TEXT
                ================================= */}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <MessageSquareWarning className="h-4 w-4 text-slate-600" />

                    <h3 className="text-sm font-bold text-slate-900">
                      Suspicious Text
                    </h3>

                  </div>

                  <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {analysis.suspiciousText ||
                        "No suspicious text identified in the screenshot."}
                    </p>

                  </div>

                </div>

                {/* =================================
                    AI EXPLANATION
                ================================= */}

                <div className="mt-5 rounded-2xl border border-slate-200 p-4">

                  <div className="flex items-center gap-2">

                    <Bot className="h-4 w-4 text-slate-700" />

                    <h3 className="text-sm font-bold text-slate-900">
                      AI Explanation
                    </h3>

                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {analysis.explanation ||
                      "The AI did not provide an additional explanation."}
                  </p>

                </div>

                {/* =================================
                    RECOMMENDATION
                ================================= */}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">

                  <div className="flex items-center gap-2">

                    <ShieldCheck className="h-5 w-5" />

                    <h3 className="text-sm font-bold">
                      Recommended Action
                    </h3>

                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {analysis.recommendation ||
                      "Do not share passwords, OTPs, PINs or banking information. Verify suspicious requests through an official channel."}
                  </p>

                </div>

                {/* =================================
                    ACTION BUTTONS
                ================================= */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {/* Guardian */}

                  <button
                    type="button"
                    onClick={alertGuardian}
                    disabled={
                      isGuardianAlerting ||
                      guardianAlerted
                    }
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                      guardianAlerted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                  >

                    {isGuardianAlerting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Alerting Guardian...
                      </>
                    ) : guardianAlerted ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Guardian Alerted
                      </>
                    ) : (
                      <>
                        <UserRound className="h-5 w-5" />
                        Alert Guardian
                      </>
                    )}

                  </button>

                  {/* Report */}

                  <button
                    type="button"
                    onClick={
                      downloadIncidentReport
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    <Download className="h-5 w-5" />
                    Incident Report
                  </button>

                </div>

                {/* =================================
                    ANALYZE ANOTHER
                ================================= */}

                <button
                  type="button"
                  onClick={resetAnalyzer}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Analyze Another Screenshot
                </button>

              </div>
            )}

          </section>

        </div>

        {/* =================================
            SECURITY NOTICE
        ================================= */}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Lock className="h-5 w-5 text-slate-700" />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-bold text-slate-900">
                Stay Safe
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Cyber Shield AI can identify
                suspicious patterns, but never share
                OTPs, passwords, PINs or banking
                credentials based only on a message
                or screenshot.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              Protection Active
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}