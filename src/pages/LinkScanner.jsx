
import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function LinkScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/scanner/scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Scan failed");
      }

      setResult(data);
    } catch (error) {
      console.error("Scanner Error:", error);

      setResult({
        status: "error",
        message:
          error.message ||
          "Unable to connect to Cyber Shield server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = result?.stats || {};

  const riskScore =
    result?.status === "malicious"
      ? 100
      : result?.status === "suspicious"
      ? 60
      : result?.status === "safe"
      ? 0
      : 25;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">
          SECURITY TOOL
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Safe Link Scanner
        </h1>

        <p className="mt-2 text-slate-500">
          Check a suspicious URL for potential security threats.
        </p>
      </div>

      {/* Scanner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Enter URL
        </label>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                scanUrl();
              }
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />

          <button
            onClick={scanUrl}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Scan Link
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Never enter passwords, OTPs or other sensitive information.
        </p>
      </div>

      {/* Error */}
      {result?.status === "error" && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={22} />

            <div>
              <p className="font-semibold text-red-800">
                Scan failed
              </p>

              <p className="text-sm text-red-600">
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && result.status !== "error" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {result.status === "safe" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <ShieldCheck size={25} />
              </div>
            )}

            {result.status === "suspicious" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                <AlertTriangle size={25} />
              </div>
            )}

            {result.status === "malicious" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <XCircle size={25} />
              </div>
            )}

            {result.status === "unknown" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <AlertTriangle size={25} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold capitalize text-slate-900">
                {result.status}
              </h2>

              <p className="text-sm text-slate-500">
                {result.message}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-slate-500">
                Malicious
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                {stats.malicious ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-xs text-slate-500">
                Suspicious
              </p>

              <p className="mt-1 text-xl font-bold text-yellow-600">
                {stats.suspicious ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-slate-500">
                Harmless
              </p>

              <p className="mt-1 text-xl font-bold text-green-600">
                {stats.harmless ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Undetected
              </p>

              <p className="mt-1 text-xl font-bold text-slate-700">
                {stats.undetected ?? 0}
              </p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Risk Score
              </span>

              <span className="text-lg font-bold text-slate-900">
                {riskScore}/100
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${riskScore}%`,
                }}
              />
            </div>
          </div>

          {/* URL */}
          <p className="mt-4 break-all text-xs text-slate-400">
            Scanned URL: {result.url || url}
          </p>
        </div>
      )}
    </div>
  );
}

export default LinkScanner;