import { useState } from "react";
import {
  ShieldAlert,
  Camera,
  Clock3,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Download,
  BellRing,
  X,
} from "lucide-react";

function ScreenshotAnalyzer() {
  const [captured, setCaptured] = useState(false);
  const [guardianAlerted, setGuardianAlerted] = useState(false);

  const captureEvidence = () => {
    setCaptured(true);
    setGuardianAlerted(false);
  };

  const alertGuardian = () => {
    setGuardianAlerted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
          <ShieldAlert size={18} />
          AI Evidence Protection
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Evidence Capture
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Preserve digital evidence when AI detects a high-risk scam.
        </p>
      </div>

      {/* Detection Banner */}
      {!captured ? (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <ShieldAlert size={25} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-100">
                  AI Protection Status
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Waiting for suspicious activity
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Evidence capture activates when a high-risk scam is detected.
                </p>
              </div>
            </div>

            <button
              onClick={captureEvidence}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Camera size={18} />
              Simulate Detection
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={23} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                High Risk Scam Detected
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Evidence automatically preserved
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Suspicious conversation signals were detected and an incident
                record has been created.
              </p>
            </div>

            <button
              onClick={() => setCaptured(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Evidence Overview */}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Evidence Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Captured Evidence
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Digital evidence preserved during the incident
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Evidence #CS-1048
            </div>
          </div>

          {!captured ? (
            <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                  <Camera size={23} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No evidence captured
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Evidence will appear here after scam detection.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex h-[280px] items-center justify-center bg-slate-900">
                <div className="w-[78%] max-w-md rounded-xl bg-white p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        INCOMING CALL
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        +91 98XX XXX 421
                      </p>
                    </div>

                    <div className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                      HIGH RISK
                    </div>
                  </div>

                  <div className="py-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Phone size={25} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      Suspicious Call Evidence
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Evidence captured by Cyber Shield AI
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-[10px] text-slate-400">
                    <span>13 Aug 2026 • 11:24 AM</span>
                    <span>CS-1048</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Risk Score
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span
                  className={`text-4xl font-bold ${
                    captured ? "text-red-600" : "text-slate-900"
                  }`}
                >
                  {captured ? "92" : "0"}
                </span>

                <span className="mb-1 text-sm text-slate-400">/100</span>
              </div>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                captured
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-50 text-slate-300"
              }`}
            >
              <ShieldAlert size={21} />
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                captured ? "w-[92%] bg-red-500" : "w-0"
              }`}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Risk level</span>
            <span
              className={`font-bold ${
                captured ? "text-red-600" : "text-green-600"
              }`}
            >
              {captured ? "HIGH" : "LOW"}
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Details */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Detected Scam Signals
              </h2>

              <p className="text-xs text-slate-400">
                Signals identified by AI
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              "Urgent account verification request",
              "OTP / verification code request",
              "Threat of account suspension",
              "Request for sensitive information",
            ].map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded-xl bg-red-50 px-3 py-2.5"
              >
                <AlertTriangle size={15} className="text-red-500" />
                <span className="text-xs font-medium text-slate-700">
                  {signal}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Mic size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Conversation Evidence
              </h2>

              <p className="text-xs text-slate-400">
                Suspicious phrases detected
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              “Your account will be blocked. Please share the OTP to complete
              your verification.”
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Clock3 size={13} />
              Detected at 11:24:18 AM
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Metadata */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Incident Details</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            icon={Phone}
            label="Caller"
            value={captured ? "+91 98XX XXX 421" : "Waiting"}
          />

          <Detail
            icon={Clock3}
            label="Timestamp"
            value={captured ? "13 Aug 2026 • 11:24 AM" : "—"}
          />

          <Detail
            icon={ShieldAlert}
            label="Risk Score"
            value={captured ? "92 / 100" : "—"}
          />

          <Detail
            icon={FileText}
            label="Incident ID"
            value={captured ? "CS-1048" : "—"}
          />
        </div>
      </div>

      {/* Actions */}
      {captured && (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Users size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Guardian Protection
              </p>

              <p className="text-xs text-slate-500">
                Notify your trusted contact about this incident.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={alertGuardian}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                guardianAlerted
                  ? "bg-green-600 text-white"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              {guardianAlerted ? (
                <>
                  <CheckCircle2 size={16} />
                  Guardian Alerted
                </>
              ) : (
                <>
                  <BellRing size={16} />
                  Alert Guardian
                </>
              )}
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <Download size={16} />
              Incident Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default ScreenshotAnalyzer;