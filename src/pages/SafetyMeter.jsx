import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Link2,
  PhoneCall,
  RefreshCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function SafetyMeter() {
  // ==================================================
  // STATE
  // ==================================================

  const [score, setScore] = useState(100);

  const [level, setLevel] = useState("Low Risk");

  const [description, setDescription] = useState(
    "Your recent security activity looks safe."
  );

  const [stats, setStats] = useState({
    ai: 0,
    links: 0,
    calls: 0,
    sos: 0,
  });

  const [events, setEvents] = useState([]);

  const [summary, setSummary] = useState({
    totalEvents: 0,
    totalRisk: 0,
    averageRisk: 0,
  });

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ==================================================
  // FETCH SAFETY METER
  // ==================================================

  const fetchSafetyData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/safety-meter`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load safety meter."
        );
      }

      const data = result.data || {};

      // ------------------------------------------------
      // SCORE
      // ------------------------------------------------

      setScore(
        Math.max(
          0,
          Math.min(
            100,
            Number(data.score ?? 100)
          )
        )
      );

      // ------------------------------------------------
      // LEVEL
      // ------------------------------------------------

      setLevel(
        data.level || "Low Risk"
      );

      setDescription(
        data.description ||
          "Your recent security activity looks safe."
      );

      // ------------------------------------------------
      // DYNAMIC STATS
      // ------------------------------------------------

      setStats({
        ai: Number(
          data.stats?.ai || 0
        ),

        links: Number(
          data.stats?.links || 0
        ),

        calls: Number(
          data.stats?.calls || 0
        ),

        sos: Number(
          data.stats?.sos || 0
        ),
      });

      // ------------------------------------------------
      // RECENT EVENTS
      // ------------------------------------------------

      setEvents(
        Array.isArray(data.events)
          ? data.events
          : []
      );

      // ------------------------------------------------
      // SUMMARY
      // ------------------------------------------------

      setSummary({
        totalEvents: Number(
          data.summary?.totalEvents || 0
        ),

        totalRisk: Number(
          data.summary?.totalRisk || 0
        ),

        averageRisk: Number(
          data.summary?.averageRisk || 0
        ),
      });
    } catch (err) {
      console.error(
        "SAFETY METER ERROR:",
        err
      );

      setError(
        "Unable to load safety meter data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // INITIAL LOAD + AUTO REFRESH
  // ==================================================

  useEffect(() => {
    fetchSafetyData();

    const interval = setInterval(() => {
      fetchSafetyData(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // MANUAL REFRESH
  // ==================================================

  const handleRefresh = () => {
    fetchSafetyData(true);
  };

  // ==================================================
  // SCORE COLOR / STATUS
  // ==================================================

  const scoreStatus = useMemo(() => {
    if (score <= 25) {
      return {
        label: "Critical Risk",
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-600",
      };
    }

    if (score <= 50) {
      return {
        label: "High Risk",
        text: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-600",
      };
    }

    if (score <= 75) {
      return {
        label: "Moderate Risk",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-600",
      };
    }

    return {
      label: "Protected",
      text: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
    };
  }, [score]);

  // ==================================================
  // RISK RING
  // ==================================================

  const ringDegrees =
    Math.max(
      0,
      Math.min(100, score)
    ) * 3.6;

  // ==================================================
  // EVENT TYPE
  // ==================================================

  const getEventType = (event) => {
    const value = String(
      event?.type ||
        event?.title ||
        ""
    ).toLowerCase();

    if (
      value.includes("link") ||
      value.includes("url")
    ) {
      return "link";
    }

    if (
      value.includes("call") ||
      value.includes("caller")
    ) {
      return "call";
    }

    if (
      value.includes("sos") ||
      value.includes("emergency")
    ) {
      return "sos";
    }

    if (
      value.includes("guardian") ||
      value.includes("ai") ||
      value.includes("screenshot")
    ) {
      return "ai";
    }

    return "security";
  };

  // ==================================================
  // EVENT ICON
  // ==================================================

  const getEventIcon = (event) => {
    const type = getEventType(event);

    if (type === "link") {
      return Link2;
    }

    if (type === "call") {
      return PhoneCall;
    }

    if (type === "sos") {
      return Siren;
    }

    if (type === "ai") {
      return Bot;
    }

    return Activity;
  };

  // ==================================================
  // EVENT STYLES
  // ==================================================

  const getEventStyles = (event) => {
    const type = getEventType(event);

    if (event?.severity === "critical") {
      return {
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        badgeBg: "bg-red-50",
        badgeColor: "text-red-600",
      };
    }

    if (event?.severity === "high") {
      return {
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        badgeBg: "bg-orange-50",
        badgeColor: "text-orange-600",
      };
    }

    if (event?.severity === "medium") {
      return {
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        badgeBg: "bg-amber-50",
        badgeColor: "text-amber-600",
      };
    }

    if (type === "link") {
      return {
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        badgeBg: "bg-purple-50",
        badgeColor: "text-purple-600",
      };
    }

    if (type === "call") {
      return {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        badgeBg: "bg-blue-50",
        badgeColor: "text-blue-600",
      };
    }

    if (type === "sos") {
      return {
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        badgeBg: "bg-red-50",
        badgeColor: "text-red-600",
      };
    }

    if (type === "ai") {
      return {
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        badgeBg: "bg-indigo-50",
        badgeColor: "text-indigo-600",
      };
    }

    return {
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      badgeBg: "bg-slate-100",
      badgeColor: "text-slate-600",
    };
  };

  // ==================================================
  // EVENT SOURCE NAME
  // ==================================================

  const getEventSource = (event) => {
    const type = getEventType(event);

    if (type === "link") {
      return "Link Scanner";
    }

    if (type === "call") {
      return "Live Call Monitoring";
    }

    if (type === "sos") {
      return "Emergency SOS";
    }

    if (type === "ai") {
      return "AI Guardian";
    }

    return "Security Monitor";
  };

  // ==================================================
  // TIME FORMAT
  // ==================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const created = new Date(date);

    if (
      Number.isNaN(
        created.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor(
      (now.getTime() -
        created.getTime()) /
        1000
    );

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(
        diff / 60
      )} min ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(
        diff / 3600
      )} hours ago`;
    }

    if (diff < 172800) {
      return "Yesterday";
    }

    return created.toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==================================================
  // EXACT CLOCK TIME
  // ==================================================

  const formatClockTime = (date) => {
    if (!date) {
      return "";
    }

    const created = new Date(date);

    if (
      Number.isNaN(
        created.getTime()
      )
    ) {
      return "";
    }

    return created.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div className="h-[430px] animate-pulse rounded-3xl bg-white shadow-sm" />

          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Shield size={19} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Real-Time Security
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Safety Meter
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            AI Guardian, Link Scanner and Live Call Monitoring combined security analysis.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <div className="hidden items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700 md:flex">

            <span className="h-2 w-2 rounded-full bg-green-500" />

            Alerts Enabled

          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
          >

            <RefreshCcw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </section>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">

          <AlertTriangle size={15} />

          {error}

        </div>
      )}

      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <section className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">

        {/* ==================================================
            SECURITY SCORE
        ================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Overall Security Health
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Combined from your recent security activity
              </p>

            </div>

            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">

              <Activity
                size={14}
                className="text-blue-600"
              />

              Live monitoring

            </div>

          </div>

          {/* SCORE RING */}

          <div className="flex justify-center py-9">

            <div
              className="relative flex h-80 w-80 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#2563eb ${ringDegrees}deg, #e2e8f0 ${ringDegrees}deg)`,
              }}
            >

              <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">

                <span className="text-6xl font-bold tracking-tight text-slate-900">
                  {score}
                </span>

                <span className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Safety Score
                </span>

                <span className="mt-2 text-[10px] text-slate-400">
                  / 100
                </span>

              </div>

            </div>

          </div>

          {/* RISK MESSAGE */}

          <div
            className={`rounded-2xl border p-5 ${scoreStatus.bg} ${scoreStatus.border}`}
          >

            <div className="flex items-start gap-4">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white ${scoreStatus.icon}`}
              >

                {score <= 50 ? (
                  <ShieldAlert size={24} />
                ) : (
                  <ShieldCheck size={24} />
                )}

              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h3
                    className={`text-base font-bold ${scoreStatus.text}`}
                  >
                    {level || scoreStatus.label}
                  </h3>

                  <span
                    className={`rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase ${scoreStatus.text}`}
                  >
                    {score <= 50
                      ? "Action Recommended"
                      : "Protection Active"}
                  </span>

                </div>

                <p
                  className={`mt-1 text-xs leading-5 ${scoreStatus.text}`}
                >
                  {description}
                </p>

              </div>

            </div>

          </div>

          {/* SCORE BAR */}

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-[10px] font-medium text-slate-400">
                Security health
              </span>

              <span
                className={`text-[10px] font-bold ${scoreStatus.text}`}
              >
                {score}/100
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700"
                style={{
                  width: `${score}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* ==================================================
            DYNAMIC SOURCE STATS
        ================================================== */}

        <div className="space-y-4">

          {/* AI GUARDIAN */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Bot size={21} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    AI Guardian
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    AI security analysis
                  </p>

                </div>

              </div>

              <span className="text-2xl font-bold text-slate-900">
                {stats.ai}
              </span>

            </div>

          </div>

          {/* LINK SCANNER */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <Link2 size={21} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Link Scanner
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    URL security checks
                  </p>

                </div>

              </div>

              <span className="text-2xl font-bold text-slate-900">
                {stats.links}
              </span>

            </div>

          </div>

          {/* LIVE CALL */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <PhoneCall size={21} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Live Call Monitoring
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Caller security analysis
                  </p>

                </div>

              </div>

              <span className="text-2xl font-bold text-slate-900">
                {stats.calls}
              </span>

            </div>

          </div>

          {/* SOS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Siren size={21} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Emergency SOS
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Emergency security events
                  </p>

                </div>

              </div>

              <span className="text-2xl font-bold text-slate-900">
                {stats.sos}
              </span>

            </div>

          </div>

          {/* COMBINED PROTECTION */}

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Sparkles size={21} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-blue-700">
                  Combined Protection
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-blue-600">
                  Safety Meter combines AI, links, calls and emergency events into one security view.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={18} />
            </div>

            <div>

              <p className="text-[10px] font-medium text-slate-400">
                Total Events
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {summary.totalEvents}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <ShieldAlert size={18} />
            </div>

            <div>

              <p className="text-[10px] font-medium text-slate-400">
                Total Risk
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {summary.totalRisk}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <HeartPulse size={18} />
            </div>

            <div>

              <p className="text-[10px] font-medium text-slate-400">
                Average Risk
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {summary.averageRisk}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SAFETY RECOMMENDATIONS
      ================================================== */}

      {score <= 75 && (
        <section className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <ShieldAlert size={20} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-orange-700">
                  Take immediate action
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-orange-600">
                  Do not share OTPs, passwords, PINs or banking information. Stop interacting with suspicious people or services.
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <PhoneCall size={20} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-orange-700">
                  Be careful with callers
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-orange-600">
                  Never share OTPs, card details, passwords or remote-access permissions with unexpected callers.
                </p>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* ==================================================
          RECENT SECURITY ACTIVITY
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-slate-900">
              Recent Security Activity
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Activity collected from AI Guardian, Link Scanner, Live Call Monitoring and SOS.
            </p>

          </div>

          <Activity
            size={20}
            className="text-blue-600"
          />

        </div>

        <div className="mt-5 space-y-3">

          {events.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                <CheckCircle2 size={28} />

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No security activity yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                Your recent security events will appear here automatically when Cyber Shield detects activity.
              </p>

            </div>

          ) : (

            events
              .slice(0, 8)
              .map((event) => {

                const Icon =
                  getEventIcon(event);

                const styles =
                  getEventStyles(event);

                const source =
                  getEventSource(event);

                return (
                  <div
                    key={event._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-white hover:shadow-sm"
                  >

                    <div className="flex items-center gap-4">

                      {/* ICON */}

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
                      >

                        <Icon size={20} />

                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-xs font-bold text-slate-800">
                              {event.title ||
                                source}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase ${styles.badgeBg} ${styles.badgeColor}`}
                            >
                              {event.riskLevel ||
                                event.severity ||
                                "LOW"}
                            </span>

                          </div>

                          <div className="flex shrink-0 items-center gap-1 text-[9px] text-slate-400">

                            <Clock3 size={11} />

                            {formatClockTime(
                              event.createdAt
                            )}

                          </div>

                        </div>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          {event.description ||
                            "Security activity detected by Cyber Shield."}
                        </p>

                      </div>

                      {/* RISK POINTS */}

                      <div className="hidden shrink-0 text-right sm:block">

                        <p
                          className={`text-xs font-bold ${
                            Number(
                              event.riskScore ||
                                event.points ||
                                0
                            ) > 0
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >

                          {Number(
                            event.riskScore ||
                              event.points ||
                              0
                          ) > 0
                            ? `↓ ${Number(
                                event.riskScore ||
                                  event.points ||
                                  0
                              )}`
                            : "Safe"}

                        </p>

                        <p className="mt-1 text-[8px] text-slate-400">
                          {formatTime(
                            event.createdAt
                          )}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })

          )}

        </div>

      </section>

      {/* ==================================================
          FOOTER STATUS
      ================================================== */}

      <div className="flex items-center justify-center gap-2 pb-5 text-[10px] text-slate-400">

        <Bell size={12} />

        Security activity updates automatically every 10 seconds.

      </div>

    </div>
  );
}

export default SafetyMeter;