import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  ShieldAlert,
  Link2,
  PhoneCall,
  ShieldCheck,
  BrainCircuit,
  CheckCircle2,
  Check,
  Trash2,
  Filter,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function Notifications() {
  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [notifications, setNotifications] = useState([]);

  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH NOTIFICATIONS
  // --------------------------------------------------

  const fetchNotifications = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/security-notifications`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load notifications."
        );
      }

      setNotifications(
        result.data?.notifications || []
      );
    } catch (err) {
      console.error(
        "NOTIFICATIONS ERROR:",
        err
      );

      setError(
        "Unable to load security notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // --------------------------------------------------

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  // --------------------------------------------------
  // UNREAD COUNT
  // --------------------------------------------------

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => notification.unread
    ).length;
  }, [notifications]);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.type === filter
    );
  }, [notifications, filter]);

  // --------------------------------------------------
  // MARK ONE READ
  // --------------------------------------------------

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/security-notifications/${id}/read`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to mark notification as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                unread: false,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "MARK READ ERROR:",
        err
      );
    }
  };

  // --------------------------------------------------
  // MARK ALL READ
  // --------------------------------------------------

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/security-notifications/read-all`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to mark notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
    } catch (err) {
      console.error(
        "MARK ALL READ ERROR:",
        err
      );
    }
  };

  // --------------------------------------------------
  // CLEAR ALL
  // --------------------------------------------------

  const clearAll = async () => {
    if (notifications.length === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/security-notifications`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to clear notifications."
        );
      }

      setNotifications([]);
    } catch (err) {
      console.error(
        "CLEAR NOTIFICATIONS ERROR:",
        err
      );
    }
  };

  // --------------------------------------------------
  // ICON
  // --------------------------------------------------

  const getNotificationIcon = (
    notification
  ) => {
    if (notification.source === "link") {
      return Link2;
    }

    if (notification.source === "call") {
      return PhoneCall;
    }

    if (notification.source === "ai") {
      return BrainCircuit;
    }

    return ShieldCheck;
  };

  // --------------------------------------------------
  // TYPE STYLES
  // --------------------------------------------------

  const getTypeStyles = (
    type,
    severity
  ) => {
    if (
      severity === "critical" ||
      severity === "high"
    ) {
      return {
        bg: "bg-red-50",
        icon: "text-red-600",
        label: "Threat Alert",
        labelBg:
          "bg-red-50 text-red-600",
      };
    }

    if (type === "ai") {
      return {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        label: "AI Guardian",
        labelBg:
          "bg-purple-50 text-purple-600",
      };
    }

    return {
      bg: "bg-green-50",
      icon: "text-green-600",
      label: "Protection",
      labelBg:
        "bg-green-50 text-green-600",
    };
  };

  // --------------------------------------------------
  // TIME FORMAT
  // --------------------------------------------------

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) {
      return "";
    }

    const now = new Date();

    const diff =
      Math.floor(
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

    return created.toLocaleDateString();
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}

      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Bell size={19} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Security Center
            </span>

          </div>

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}

          </div>

          <p className="mt-2 text-sm text-slate-500">
            Stay informed about real security events
            detected by Cyber Shield.
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
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

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >

            <Check size={14} />

            Mark all read

          </button>

          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >

            <Trash2 size={14} />

            Clear all

          </button>

        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">

          <AlertTriangle size={15} />

          {error}

        </div>
      )}

      {/* SECURITY STATUS */}

      <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={25} />
            </div>

            <div>

              <p className="text-sm font-bold">
                Protection notifications
              </p>

              <p className="mt-1 text-[10px] text-blue-200">
                Alerts are generated only when
                Cyber Shield detects meaningful
                security activity.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-400/10 px-4 py-3">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold text-green-300">
              Monitoring active
            </span>

          </div>

        </div>

      </section>

      {/* FILTERS */}

      <section className="flex flex-wrap items-center gap-2">

        <div className="mr-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">

          <Filter size={13} />

          Filter

        </div>

        {[
          {
            id: "all",
            label: "All",
          },
          {
            id: "threat",
            label: "Threats",
          },
          {
            id: "protection",
            label: "Protection",
          },
          {
            id: "ai",
            label: "AI Guardian",
          },
        ].map((item) => (

          <button
            key={item.id}
            onClick={() =>
              setFilter(item.id)
            }
            className={`rounded-xl px-4 py-2 text-[10px] font-bold transition ${
              filter === item.id
                ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>

        ))}

      </section>

      {/* NOTIFICATIONS */}

      <section className="space-y-3">

        {loading ? (

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <RefreshCcw
              size={25}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-xs text-slate-400">
              Loading security notifications...
            </p>

          </div>

        ) : filteredNotifications.length === 0 ? (

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">

              <CheckCircle2 size={28} />

            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-800">
              No security alerts
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              {filter === "all"
                ? "No security alerts have been generated. Your protection system is operating normally."
                : "No notifications match your current filter."}
            </p>

          </div>

        ) : (

          filteredNotifications.map(
            (notification) => {

              const Icon =
                getNotificationIcon(
                  notification
                );

              const styles =
                getTypeStyles(
                  notification.type,
                  notification.severity
                );

              return (

                <div
                  key={notification._id}
                  className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    notification.unread
                      ? "border-blue-100"
                      : "border-slate-200"
                  }`}
                >

                  <div className="flex gap-4">

                    {/* ICON */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.icon}`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2
                            className={`text-sm ${
                              notification.unread
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </h2>

                          {notification.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          )}

                        </div>

                        <span className="shrink-0 text-[9px] font-medium text-slate-400">
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>

                      </div>

                      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">

                          <span
                            className={`rounded-lg px-2.5 py-1 text-[9px] font-bold ${styles.labelBg}`}
                          >
                            {styles.label}
                          </span>

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase text-slate-500">
                            {notification.severity}
                          </span>

                        </div>

                        {notification.unread && (

                          <button
                            onClick={() =>
                              markAsRead(
                                notification._id
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                          >

                            <Check size={12} />

                            Mark as read

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              );
            }
          )

        )}

      </section>

      {/* FOOTER */}

      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">

        <ShieldAlert size={12} />

        Important security alerts will automatically
        appear here.

      </div>

    </div>
  );
}

export default Notifications;