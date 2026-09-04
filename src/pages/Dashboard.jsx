import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Link2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const chartData = [
  { day: "Mon", threats: 4 },
  { day: "Tue", threats: 7 },
  { day: "Wed", threats: 5 },
  { day: "Thu", threats: 11 },
  { day: "Fri", threats: 8 },
  { day: "Sat", threats: 14 },
  { day: "Sun", threats: 9 },
];

const stats = [
  {
    title: "Devices Protected",
    value: "04",
    change: "+1",
    trend: "up",
    icon: ShieldCheck,
    description: "All devices secure",
  },
  {
    title: "Calls Monitored",
    value: "128",
    change: "+18%",
    trend: "up",
    icon: PhoneCall,
    description: "This week",
  },
  {
    title: "Scams Blocked",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: AlertTriangle,
    description: "Threats prevented",
  },
  {
    title: "Unsafe Links",
    value: "17",
    change: "-8%",
    trend: "down",
    icon: Link2,
    description: "Blocked this month",
  },
];

const alerts = [
  {
    title: "Suspicious banking message detected",
    type: "High Risk",
    time: "12 min ago",
  },
  {
    title: "Unknown caller flagged by AI",
    type: "Warning",
    time: "46 min ago",
  },
  {
    title: "Unsafe link successfully blocked",
    type: "Blocked",
    time: "2 hrs ago",
  },
];

function Dashboard() {
  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-600">
            CYBER SHIELD AI
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Good morning, Riyar4` 
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your digital environment is being monitored and protected.
          </p>
        </div>

        <button className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
          <Activity size={17} />
          Run Security Scan
        </button>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-700 to-blue-900 p-6 text-white shadow-xl shadow-blue-900/10 md:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <ShieldCheck size={18} />
              </span>

              <span className="text-sm font-medium text-blue-100">
                Overall Security Status
              </span>
            </div>

            <h2 className="text-3xl font-bold md:text-4xl">
              You're Protected
            </h2>

            <p className="mt-2 max-w-xl text-sm text-blue-100">
              No critical threats have been detected across your monitored
              activities.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-white/20 border-t-white">
              <div className="text-center">
                <p className="text-3xl font-bold">92</p>
                <p className="text-[10px] text-blue-100">SCORE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={20} />
                </div>

                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                    stat.trend === "up"
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {stat.change}
                </span>
              </div>

              <p className="mt-5 text-xs font-medium text-slate-500">
                {stat.title}
              </p>

              <div className="mt-1 flex items-end gap-2">
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Threat Activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Security events detected this week
              </p>
            </div>

            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Monitoring
            </span>
          </div>

          <div className="mt-5 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="threatGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="threats"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#threatGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Recent Alerts
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Latest security activity
              </p>
            </div>

            <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={alert.title}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    index === 0
                      ? "bg-red-50 text-red-600"
                      : index === 1
                      ? "bg-amber-50 text-amber-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {index === 0 ? (
                    <AlertTriangle size={17} />
                  ) : index === 1 ? (
                    <PhoneCall size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-4 text-slate-800">
                    {alert.title}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-400">
                      {alert.time}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                        index === 0
                          ? "bg-red-50 text-red-600"
                          : index === 1
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {alert.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-[11px] text-blue-700">
            <Clock3 size={15} />
            AI protection is actively monitoring your account.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;