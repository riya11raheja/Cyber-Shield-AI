import { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  PhoneCall,
  Ban,
  Link2,
  ScanSearch,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

function SecurityDashboard() {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState("2 minutes ago");

  const handleScan = () => {
    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      setLastScan("Just now");
    }, 2000);
  };

  const stats = [
    {
      title: "Devices Protected",
      value: "3",
      subtitle: "All devices secure",
      icon: Smartphone,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      title: "Calls Monitored",
      value: "128",
      subtitle: "+12 this week",
      icon: PhoneCall,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-700",
    },
    {
      title: "Scams Blocked",
      value: "24",
      subtitle: "Threats prevented",
      icon: Ban,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Unsafe Links",
      value: "17",
      subtitle: "Links blocked",
      icon: Link2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck size={19} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Security Center
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Security Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Real-time overview of your digital protection.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw
            size={15}
            className={scanning ? "animate-spin" : ""}
          />

          {scanning ? "Scanning..." : "Run Security Scan"}
        </button>
      </div>

      {/* SECURITY SCORE */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl md:p-7">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck size={17} />
              </span>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Overall Security
              </p>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight">
                96
              </span>

              <span className="mb-2 text-sm text-blue-200">
                / 100
              </span>
            </div>

            <p className="mt-2 text-xs text-blue-200">
              Your security posture is excellent.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-2 flex justify-between text-[10px] font-semibold">
              <span className="text-blue-100">
                Protection level
              </span>

              <span className="text-green-300">
                Excellent
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-green-400 transition-all"
                style={{ width: "96%" }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-200">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              AI Guardian is actively protecting this account
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon size={19} />
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-slate-300"
                />
              </div>

              <p className="mt-5 text-xs font-medium text-slate-400">
                {stat.title}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-500">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      {/* LOWER GRID */}
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

        {/* SECURITY ACTIVITY */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Security Activity
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Recent protection events
              </p>
            </div>

            <Activity
              size={19}
              className="text-blue-700"
            />
          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center gap-4 rounded-2xl bg-green-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <CheckCircle2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Suspicious link blocked
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Malicious destination detected
                </p>
              </div>

              <span className="text-[9px] font-semibold text-slate-400">
                8 min ago
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <PhoneCall size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Caller verification completed
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Caller identified as low risk
                </p>
              </div>

              <span className="text-[9px] font-semibold text-slate-400">
                24 min ago
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-amber-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertTriangle size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Suspicious message detected
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Potential phishing attempt identified
                </p>
              </div>

              <span className="text-[9px] font-semibold text-slate-400">
                1 hr ago
              </span>
            </div>

          </div>
        </div>

        {/* LAST SCAN */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Security Scan
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Latest system analysis
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ScanSearch size={19} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Scan completed
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Clock3 size={12} />
                {lastScan}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Threats detected
              </span>

              <span className="font-bold text-green-600">
                0
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Security checks
              </span>

              <span className="font-bold text-slate-800">
                42/42
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Protection status
              </span>

              <span className="font-bold text-green-600">
                Secure
              </span>
            </div>

          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
          >
            <ScanSearch size={15} />

            {scanning ? "Analyzing..." : "Scan Again"}
          </button>
        </div>
      </section>

      {/* LIVE PROTECTION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <ShieldCheck size={23} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Protection
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                All security systems are operating normally.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-xs font-bold text-green-700">
              Protection Active
            </span>
          </div>

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">

          {[
            "Link Protection",
            "Call Protection",
            "Scam Detection",
            "AI Guardian",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
            >
              <CheckCircle2
                size={15}
                className="text-green-500"
              />

              <span className="text-[10px] font-semibold text-slate-600">
                {item}
              </span>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}

export default SecurityDashboard;