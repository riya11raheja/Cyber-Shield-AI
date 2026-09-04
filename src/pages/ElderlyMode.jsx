import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Phone,
  Users,
  Link2,
  Volume2,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  Lock,
  ArrowRight,
  BellRing,
  UserRound,
  X,
} from "lucide-react";

function ElderlyMode() {
  const navigate = useNavigate();

  const [sosActive, setSosActive] = useState(false);
  const [guardianEnabled, setGuardianEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [guardianLoading, setGuardianLoading] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  // =========================================================
  // NOTIFICATION / TOAST
  // =========================================================

  const showNotification = (message, type = "success") => {
    const id = Date.now();

    setAlerts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    // Automatically remove after 4 seconds
    setTimeout(() => {
      setAlerts((prev) =>
        prev.filter((alert) => alert.id !== id)
      );
    }, 4000);
  };

  const removeNotification = (id) => {
    setAlerts((prev) =>
      prev.filter((alert) => alert.id !== id)
    );
  };

  // =========================================================
  // GET ELDERLY STATUS
  // =========================================================

  useEffect(() => {
    const loadElderlyStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/elderly/status"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        /*
          Backend response different formats ko handle karne ki
          koshish kar rahe hain.
        */

        const enabled =
          data?.enabled ??
          data?.guardianEnabled ??
          data?.settings?.enabled ??
          data?.data?.enabled ??
          data?.data?.guardianEnabled;

        if (typeof enabled === "boolean") {
          setGuardianEnabled(enabled);
        }
      } catch (error) {
        console.error(
          "Failed to load elderly status:",
          error
        );
      }
    };

    loadElderlyStatus();
  }, []);

  // =========================================================
  // SOS
  // =========================================================

  const handleSOS = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setSosActive(true);
    setStatusMessage("Sending emergency alert...");

    try {
      const response = await fetch(
        "http://localhost:5000/api/elderly/sos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Emergency SOS triggered from Elderly Mode",
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to send SOS alert"
        );
      }

      // SUCCESS NOTIFICATION
      showNotification(
        "Emergency alert sent. Trusted contacts are notified.",
        "success"
      );

      setStatusMessage(
        "Emergency alert activated. Trusted contacts are notified."
      );

      // Keep SOS active UI for 4 seconds
      setTimeout(() => {
        setSosActive(false);
        setStatusMessage("");
      }, 4000);
    } catch (error) {
      console.error("SOS Error:", error);

      setSosActive(false);

      showNotification(
        error.message ||
          "Unable to send emergency alert.",
        "error"
      );

      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // AI GUARDIAN TOGGLE
  // =========================================================

  const handleGuardianToggle = async () => {
    if (guardianLoading) {
      return;
    }

    const newValue = !guardianEnabled;

    // Optimistic UI
    setGuardianEnabled(newValue);
    setGuardianLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/elderly/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled: newValue,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to update AI Guardian"
        );
      }

      if (newValue) {
        showNotification(
          "AI Guardian is now ON. Your digital protection is active.",
          "success"
        );
      } else {
        showNotification(
          "AI Guardian is now OFF. Automatic protection is disabled.",
          "warning"
        );
      }
    } catch (error) {
      console.error(
        "Guardian settings error:",
        error
      );

      // Backend failed → revert UI
      setGuardianEnabled(!newValue);

      showNotification(
        error.message ||
          "Unable to update AI Guardian settings.",
        "error"
      );
    } finally {
      setGuardianLoading(false);
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goToCallerVerification = () => {
    navigate("/caller-verification");
  };

  const goToTrustedContacts = () => {
    navigate("/trusted-contacts");
  };

  const goToLinkScanner = () => {
    navigate("/link-scanner");
  };

  const goToAIAssistant = () => {
    navigate("/ai-assistant");
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-6">

      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <div className="fixed right-5 top-5 z-[9999] flex w-[min(380px,calc(100vw-40px))] flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
              alert.type === "error"
                ? "border-red-200"
                : alert.type === "warning"
                ? "border-amber-200"
                : "border-green-200"
            }`}
          >
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                alert.type === "error"
                  ? "bg-red-100 text-red-600"
                  : alert.type === "warning"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {alert.type === "error" ? (
                <AlertTriangle size={18} />
              ) : alert.type === "warning" ? (
                <AlertTriangle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>

            <div className="flex-1">
              <p
                className={`text-xs font-bold ${
                  alert.type === "error"
                    ? "text-red-700"
                    : alert.type === "warning"
                    ? "text-amber-700"
                    : "text-green-700"
                }`}
              >
                {alert.type === "error"
                  ? "Action Failed"
                  : alert.type === "warning"
                  ? "AI Guardian"
                  : "Security Update"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {alert.message}
              </p>
            </div>

            <button
              onClick={() =>
                removeNotification(alert.id)
              }
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
              <ShieldCheck size={15} />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Elderly Protection
              </span>
            </div>

            <h1 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
              Simple protection.
              <br />

              <span className="text-blue-200">
                Powerful security.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100">
              A simplified safety experience designed to help seniors stay
              protected from scams, unsafe calls and digital threats.
            </p>
          </div>

          <div className="flex min-w-[230px] flex-col items-center rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-400/15">
              <ShieldCheck
                size={34}
                className={
                  guardianEnabled
                    ? "text-green-300"
                    : "text-slate-300"
                }
              />
            </div>

            <p className="mt-3 text-sm font-bold">
              {guardianEnabled
                ? "Protection Active"
                : "Protection Paused"}
            </p>

            <div
              className={`mt-2 flex items-center gap-2 text-[10px] font-semibold ${
                guardianEnabled
                  ? "text-green-300"
                  : "text-slate-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  guardianEnabled
                    ? "bg-green-300"
                    : "bg-slate-400"
                }`}
              />

              {guardianEnabled
                ? "AI Guardian is watching"
                : "AI Guardian is turned off"}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GREETING
      ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserRound size={27} />
            </div>

            <div>
              <p className="text-xs font-semibold text-blue-600">
                Welcome back
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your safety center
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Everything you need is just one tap away.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
            <CheckCircle2
              size={17}
              className="text-green-600"
            />

            <span className="text-xs font-semibold text-green-700">
              No active threats
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMERGENCY + QUICK ACTIONS
      ====================================================== */}

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">

        {/* SOS */}
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BellRing
              size={18}
              className="text-red-600"
            />

            <h2 className="text-sm font-bold text-slate-800">
              Emergency Assistance
            </h2>
          </div>

          <div className="mt-5 flex flex-col items-center rounded-3xl bg-red-50 p-6">
            <button
              onClick={handleSOS}
              disabled={loading}
              className={`group flex h-32 w-32 items-center justify-center rounded-full text-white shadow-xl transition active:scale-95 ${
                sosActive
                  ? "bg-red-700 shadow-red-700/30"
                  : "bg-red-600 shadow-red-600/25 hover:scale-[1.03] hover:bg-red-700"
              } ${
                loading
                  ? "cursor-wait opacity-80"
                  : ""
              }`}
            >
              <div className="text-center">
                <AlertTriangle
                  size={32}
                  className="mx-auto"
                />

                <p className="mt-1 text-lg font-black tracking-wide">
                  {loading ? "..." : "SOS"}
                </p>
              </div>
            </button>

            <p className="mt-5 text-center text-sm font-bold text-red-700">
              {sosActive
                ? "Emergency alert activated"
                : "Tap for emergency help"}
            </p>

            <p className="mt-1 text-center text-[10px] leading-4 text-red-500">
              {statusMessage ||
                "Your trusted contacts can be notified."}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Quick Safety Actions
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Large controls for easy access
              </p>
            </div>

            <ShieldCheck
              size={19}
              className="text-blue-700"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            {/* CALL FAMILY */}
            <button
              onClick={goToCallerVerification}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Phone size={21} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Call Family
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </div>
            </button>

            {/* TRUSTED CONTACTS */}
            <button
              onClick={goToTrustedContacts}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users size={21} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Trusted Contacts
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </div>
            </button>

            {/* CHECK A LINK */}
            <button
              onClick={goToLinkScanner}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Link2 size={21} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Check a Link
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </div>
            </button>

            {/* GET ASSISTANCE */}
            <button
              onClick={goToAIAssistant}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Volume2 size={21} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Get Assistance
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          AI GUARDIAN
      ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
                guardianEnabled
                  ? "bg-blue-700 shadow-blue-700/20"
                  : "bg-slate-500 shadow-slate-500/20"
              }`}
            >
              <ShieldCheck size={27} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Guardian
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Automated protection against common digital scams.
              </p>

              <p
                className={`mt-1 text-[10px] font-semibold ${
                  guardianEnabled
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              >
                {guardianEnabled
                  ? "Protection is currently active"
                  : "Protection is currently paused"}
              </p>
            </div>
          </div>

          {/* TOGGLE */}
          <button
            onClick={handleGuardianToggle}
            disabled={guardianLoading}
            aria-label="Toggle AI Guardian"
            className={`relative h-8 w-14 rounded-full transition ${
              guardianEnabled
                ? "bg-blue-700"
                : "bg-slate-300"
            } ${
              guardianLoading
                ? "cursor-wait opacity-70"
                : ""
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                guardianEnabled
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">

          {/* SCAM PROTECTION */}
          <div
            className={`rounded-2xl p-4 ${
              guardianEnabled
                ? "bg-green-50"
                : "bg-slate-50"
            }`}
          >
            <CheckCircle2
              size={18}
              className={
                guardianEnabled
                  ? "text-green-600"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                guardianEnabled
                  ? "text-green-700"
                  : "text-slate-500"
              }`}
            >
              Scam Protection
            </p>

            <p
              className={`mt-1 text-[10px] ${
                guardianEnabled
                  ? "text-green-600"
                  : "text-slate-400"
              }`}
            >
              {guardianEnabled
                ? "Active"
                : "Disabled"}
            </p>
          </div>

          {/* CALL PROTECTION */}
          <div
            className={`rounded-2xl p-4 ${
              guardianEnabled
                ? "bg-blue-50"
                : "bg-slate-50"
            }`}
          >
            <Phone
              size={18}
              className={
                guardianEnabled
                  ? "text-blue-700"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                guardianEnabled
                  ? "text-blue-700"
                  : "text-slate-500"
              }`}
            >
              Call Protection
            </p>

            <p
              className={`mt-1 text-[10px] ${
                guardianEnabled
                  ? "text-blue-600"
                  : "text-slate-400"
              }`}
            >
              {guardianEnabled
                ? "Monitoring enabled"
                : "Monitoring disabled"}
            </p>
          </div>

          {/* FRAUD ALERTS */}
          <div
            className={`rounded-2xl p-4 ${
              guardianEnabled
                ? "bg-amber-50"
                : "bg-slate-50"
            }`}
          >
            <AlertTriangle
              size={18}
              className={
                guardianEnabled
                  ? "text-amber-600"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                guardianEnabled
                  ? "text-amber-700"
                  : "text-slate-500"
              }`}
            >
              Fraud Alerts
            </p>

            <p
              className={`mt-1 text-[10px] ${
                guardianEnabled
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {guardianEnabled
                ? "Real-time warnings"
                : "Warnings disabled"}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAMILY CONNECTION
      ====================================================== */}

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={21} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Family Connection
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Your trusted safety network
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                M
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Mom
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Emergency contact
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Connected
            </span>
          </div>
        </div>

        {/* HEALTH / SAFETY */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartPulse size={21} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Safety Status
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Your current protection overview
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">
                98%
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Protection Score
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
              <CheckCircle2
                size={16}
                className="text-green-600"
              />

              <span className="text-xs font-bold text-green-700">
                Excellent
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <Lock size={12} />

        Elderly Mode is designed with accessibility and safety in mind.
      </div>
    </div>
  );
}

export default ElderlyMode;