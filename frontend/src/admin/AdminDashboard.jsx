import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEmployees,
  getMessages,
  getTrash,
  getUnreadCount,
} from "../api";

import { auth } from "../utils/auth";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Settings } from "../components/Settings";
import Trash from "../components/Trash";
import AdminCompose from "../admin/email/AdminCompose";
import AdminInbox from "../admin/email/AdminInbox";
import CreateEmployee from "../admin/email/CreateEmployees";
import ManageEmployees from "../admin/ManageEmployees";

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    userPlus: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    inbox: (
      <>
        <path d="M4 4h16v16H4z" />
        <path d="M4 13h4l2 3h4l2-3h4" />
      </>
    ),

    compose: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),

    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-2.55v-.1a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.56-1H7V11.45h.04a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V5h2.55v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1H21v2.55h-.04a1.7 1.7 0 0 0-1.56 1Z" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
      </>
    ),

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);

  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, msgRes, unreadRes, trash] = await Promise.all([
          getEmployees(),
          getMessages(),
          getUnreadCount(),
          getTrash(),
        ]);

        const empList = empRes?.data || empRes || [];
        const msgList = msgRes?.data || [];

        setEmployees(empList);
        setMessages(msgList);
        setUnreadCount(unreadRes?.count || 0);
        setTrashCount(trash?.data?.length || 0);

        const sent = msgList.filter(
          (msg) => msg.sender?._id === currentUser?.id
        );

        setSentCount(sent.length);
      } catch (err) {
        if (err.message?.includes("Unauthorized")) {
          auth.logout();
          navigate("/login");
        }
      }
    }

    loadData();
  }, [navigate, currentUser?.id]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  /* =========================================================
     VIEW TITLE
  ========================================================= */

  const getViewTitle = () => {
    const titles = {
      overview: "Dashboard",
      "create-employee": "Create Employee",
      "manage-employees": "Manage Employees",
      inbox: "Inbox",
      compose: "Compose Message",
      trash: "Trash",
      settings: "Settings",
    };

    return titles[activeView] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex overflow-hidden">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden md:flex w-[270px] shrink-0 bg-[#0b1020] border-r border-white/[0.07]">
        <SidebarContent
          activeView={activeView}
          setActiveView={setActiveView}
          unreadCount={unreadCount}
        />
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">

          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-[285px] h-full bg-[#0b1020] shadow-2xl">
            <div className="absolute right-3 top-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Icon name="close" />
              </button>
            </div>

            <SidebarContent
              activeView={activeView}
              setActiveView={setActiveView}
              unreadCount={unreadCount}
              closeMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="h-[76px] shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-white/[0.07] bg-[#080d18]/90 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            <button
              className="md:hidden p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white">
                {getViewTitle()}
              </h1>

              <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                Manage your DarkMail administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">

            {/* Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>

              <span className="text-xs text-emerald-400">
                System Online
              </span>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">

              <div className="hidden lg:block text-right">
                <p className="text-sm text-gray-200 font-medium">
                  {currentUser?.name || "Administrator"}
                </p>

                <p className="text-xs text-gray-500 max-w-[180px] truncate">
                  {currentUser?.email}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
                {(currentUser?.name || currentUser?.email || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="hidden sm:flex p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <Icon name="logout" />
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="flex-1 overflow-y-auto">

          <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto">

            {activeView === "overview" && (
              <OverviewSection
                employees={employees}
                totalEmails={messages.length}
                unreadCount={unreadCount}
                sentCount={sentCount}
                trashCount={trashCount}
              />
            )}

            {activeView === "create-employee" && <CreateEmployee />}

            {activeView === "manage-employees" && <ManageEmployees />}

            {activeView === "compose" && (
              <AdminCompose employees={employees} />
            )}

            {activeView === "inbox" && <AdminInbox />}

            {activeView === "trash" && <Trash />}

            {activeView === "settings" && (
              <Settings navigate="settings" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarContent({
  activeView,
  setActiveView,
  unreadCount,
  closeMobile,
}) {
  const items = [
    {
      key: "overview",
      label: "Overview",
      icon: "dashboard",
    },
    {
      key: "create-employee",
      label: "Create Employee",
      icon: "userPlus",
    },
    {
      key: "manage-employees",
      label: "Manage Employees",
      icon: "users",
    },
    {
      key: "inbox",
      label: "Inbox",
      icon: "inbox",
    },
    {
      key: "compose",
      label: "Compose",
      icon: "compose",
    },
    {
      key: "trash",
      label: "Trash",
      icon: "trash",
    },
    {
      key: "settings",
      label: "Settings",
      icon: "settings",
    },
  ];

  const handleClick = (view) => {
    setActiveView(view);

    if (closeMobile) {
      closeMobile();
    }
  };

  return (
    <div className="flex flex-col h-full w-full px-4 py-6">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="px-3 mb-9">

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Icon name="mail" size={22} strokeWidth={2} />
          </div>

          <div>
            <h2 className="font-bold text-lg tracking-tight">
              DarkMail
            </h2>

            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-semibold">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="px-2 mb-3">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          Workspace
        </p>
      </div>

      <nav className="space-y-1.5">

        {items.map((item) => {
          const active = activeView === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}
              className={`
                group relative w-full flex items-center gap-3
                px-3.5 py-3 rounded-xl text-sm
                transition-all duration-200
                ${
                  active
                    ? "bg-indigo-500/15 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }
              `}
            >

              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-indigo-400" />
              )}

              <span
                className={`
                  flex items-center justify-center
                  h-9 w-9 rounded-lg
                  ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/[0.025] text-gray-500 group-hover:text-gray-300"
                  }
                `}
              >
                <Icon name={item.icon} size={18} />
              </span>

              <span className="flex-1 text-left">
                {item.label}
              </span>

              {item.key === "inbox" && unreadCount > 0 && (
                <span className="min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-red-500/20">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}

              {active && (
                <Icon
                  name="arrow"
                  size={15}
                  strokeWidth={1.7}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* =====================================================
          BOTTOM CARD
      ===================================================== */}

      <div className="mt-auto pt-5">

        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/[0.03] border border-indigo-500/10">

          <div className="flex items-center gap-2 mb-2">
            <Icon name="activity" size={16} />
            <span className="text-xs font-semibold text-gray-300">
              Admin Controls
            </span>
          </div>

          <p className="text-[11px] leading-5 text-gray-600">
            Manage employees, messages and system activity from one place.
          </p>
        </div>

        <p className="text-[10px] text-gray-700 text-center mt-4">
          DarkMail Admin • v1.0
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
  employees = [],
  totalEmails = 0,
  unreadCount = 0,
  sentCount = 0,
  trashCount = 0,
}) {
  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.isActive
  ).length;

  const inactiveEmployees =
    totalEmployees - activeEmployees;

  const employeeData = [
    {
      name: "Total",
      value: totalEmployees,
    },
    {
      name: "Active",
      value: activeEmployees,
    },
    {
      name: "Inactive",
      value: inactiveEmployees,
    },
  ];

  const emailData = [
    {
      name: "Total",
      value: totalEmails,
    },
    {
      name: "Sent",
      value: sentCount,
    },
    {
      name: "Unread",
      value: unreadCount,
    },
    {
      name: "Trash",
      value: trashCount,
    },
  ];

  const COLORS = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-indigo-600/20 via-[#11172a] to-violet-600/[0.08] p-6 sm:p-8">

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/10 px-3 py-1.5 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-medium text-indigo-300">
                Administration Center
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, Admin
            </h2>

            <p className="mt-2 text-sm text-gray-400 max-w-xl leading-6">
              Monitor employees, email activity and your DarkMail
              workspace from a single dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="px-4 py-3 rounded-2xl bg-black/20 border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Employees
              </p>

              <p className="text-xl font-bold mt-1">
                {totalEmployees}
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-black/20 border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Messages
              </p>

              <p className="text-xl font-bold mt-1">
                {totalEmails}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Registered accounts"
          icon="users"
          iconClass="bg-indigo-500/10 text-indigo-400"
          accent="from-indigo-500/10"
        />

        <StatCard
          title="Active Employees"
          value={activeEmployees}
          subtitle="Currently active"
          icon="activity"
          iconClass="bg-emerald-500/10 text-emerald-400"
          accent="from-emerald-500/10"
        />

        <StatCard
          title="Unread Emails"
          value={unreadCount}
          subtitle="Need your attention"
          icon="mail"
          iconClass="bg-amber-500/10 text-amber-400"
          accent="from-amber-500/10"
        />

        <StatCard
          title="Sent Emails"
          value={sentCount}
          subtitle="Messages sent"
          icon="compose"
          iconClass="bg-violet-500/10 text-violet-400"
          accent="from-violet-500/10"
        />
      </section>

      {/* =====================================================
          SECONDARY STATS
      ===================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <MiniStat
          title="Inactive Employees"
          value={inactiveEmployees}
          icon="users"
          className="text-amber-400"
        />

        <MiniStat
          title="All Messages"
          value={totalEmails}
          icon="mail"
          className="text-blue-400"
        />

        <MiniStat
          title="Trash Messages"
          value={trashCount}
          icon="trash"
          className="text-red-400"
        />
      </section>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Employee Chart */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0c1220] p-5 sm:p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="font-semibold text-white">
                Employee Statistics
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Current employee distribution
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Icon name="users" size={19} />
            </div>
          </div>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={employeeData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(255,255,255,0.03)",
                  }}
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Chart */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0c1220] p-5 sm:p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="font-semibold text-white">
                Email Statistics
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Message activity overview
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Icon name="mail" size={19} />
            </div>
          </div>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={emailData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="none"
                >
                  {emailData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />

                <text
                  x="50%"
                  y="43%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="22"
                  fontWeight="700"
                >
                  {totalEmails}
                </text>

                <text
                  x="50%"
                  y="51%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6b7280"
                  fontSize="11"
                >
                  Emails
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">

            {emailData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[index % COLORS.length],
                  }}
                />

                <div>
                  <p className="text-[11px] text-gray-500">
                    {item.name}
                  </p>

                  <p className="text-sm font-semibold text-gray-200">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVITY SUMMARY
      ===================================================== */}

      <section className="rounded-2xl border border-white/[0.07] bg-[#0c1220] p-5 sm:p-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Icon name="activity" size={19} />
          </div>

          <div>
            <h3 className="font-semibold">
              Workspace Summary
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Current DarkMail system overview
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <SummaryRow
            label="Employee accounts"
            value={totalEmployees}
          />

          <SummaryRow
            label="Active accounts"
            value={activeEmployees}
          />

          <SummaryRow
            label="Messages in trash"
            value={trashCount}
          />

        </div>
      </section>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  accent,
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl border border-white/[0.07]
        bg-gradient-to-br ${accent} to-[#0c1220]
        p-5
        hover:border-white/[0.12]
        transition-all duration-300
        group
      `}
    >

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-xl group-hover:bg-white/[0.04] transition" />

      <div className="relative flex items-start justify-between">

        <div>
          <p className="text-xs text-gray-500 font-medium">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2 tracking-tight">
            {value}
          </h3>

          <p className="text-[11px] text-gray-600 mt-2">
            {subtitle}
          </p>
        </div>

        <div
          className={`
            h-11 w-11 rounded-xl
            flex items-center justify-center
            ${iconClass}
          `}
        >
          <Icon name={icon} size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
  icon,
  className = "",
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b111e] p-4 flex items-center gap-4">

      <div
        className={`
          h-10 w-10 rounded-xl
          bg-white/[0.04]
          flex items-center justify-center
          ${className}
        `}
      >
        <Icon name={icon} size={18} />
      </div>

      <div>
        <p className="text-xs text-gray-500">
          {title}
        </p>

        <p className="text-lg font-bold text-gray-200 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] px-4 py-3.5 flex items-center justify-between">

      <span className="text-sm text-gray-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-200">
        {value}
      </span>
    </div>
  );
}
