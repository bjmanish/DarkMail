import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Mail,
  Inbox as InboxIcon,
  Send,
  FileText,
  Trash2,
  PenSquare,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getUnreadCountApi } from "../../api/messageApi";

const UserDashboard = () => {
  const {user, logout } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* --------------------------------------------------
     LOAD UNREAD COUNT
  -------------------------------------------------- */
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCountApi();

      if (response?.success) {
        setUnreadCount(
          Number(
            response?.count ??
              response?.unreadCount ??
              response?.data?.count ??
              response?.data?.unreadCount ??
              0
          )
        );
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Refresh unread count periodically
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* --------------------------------------------------
     CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
  -------------------------------------------------- */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* --------------------------------------------------
     NAVIGATION
  -------------------------------------------------- */
  const navigation = [
    {
      name: "Inbox",
      path: "/user/inbox",
      icon: InboxIcon,
      badge: unreadCount,
    },
    {
      name: "Sent",
      path: "/user/sent",
      icon: Send,
    },
    {
      name: "Drafts",
      path: "/user/drafts",
      icon: FileText,
    },
    {
      name: "Trash",
      path: "/user/trash",
      icon: Trash2,
    },
  ];

  /* --------------------------------------------------
     ACTIVE ROUTE
  -------------------------------------------------- */
  const isActive = (path) => {
    return location.pathname === path;
  };

  /* --------------------------------------------------
     LOGOUT
  -------------------------------------------------- */
  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  console.log("user Dash aord data: ", user);
  /* --------------------------------------------------
     USER DISPLAY DATA
  -------------------------------------------------- */
  const getUserName = () => {
    return (
      user?.name ||
      user?.fullName ||
      user?.employeeName ||
      user?.username ||
      "User"
    );
  };

  const getUserEmail = () => {
    return user?.email || user?.emailAddress || "";
  };

  const getInitial = () => {
    const name = getUserName();

    return name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          bg-white
          shadow-xl
          transition-transform
          duration-300
          ease-in-out

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* ------------------------------------------------
            LOGO
        ------------------------------------------------ */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5">
          <Link
            to="/user/inbox"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Mail size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                DarkMail
              </h1>

              <p className="text-xs text-gray-500">
                Internal Mail System
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* ------------------------------------------------
            COMPOSE BUTTON
        ------------------------------------------------ */}
        <div className="px-4 pt-5">
          <Link
            to="/user/compose"
            onClick={() => setSidebarOpen(false)}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-4
              py-3
              font-semibold
              text-white
              shadow-md
              transition
              hover:bg-indigo-700
              hover:shadow-lg
            "
          >
            <PenSquare size={19} />
            <span>Compose</span>
          </Link>
        </div>

        {/* ------------------------------------------------
            NAVIGATION
        ------------------------------------------------ */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Mail
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    transition

                    ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={
                        active
                          ? "text-indigo-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    />

                    <span
                      className={`text-sm ${
                        active ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {item.badge > 0 && (
                    <span
                      className="
                        min-w-[22px]
                        rounded-full
                        bg-red-500
                        px-1.5
                        py-0.5
                        text-center
                        text-xs
                        font-bold
                        text-white
                      "
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ------------------------------------------------
              ACCOUNT
          ------------------------------------------------ */}
          <div className="mt-8">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Account
            </p>

            <Link
              to="/user/settings"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition

                ${
                  isActive("/user/settings")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <Settings size={20} />
              Settings
            </Link>
          </div>
        </nav>

        {/* ------------------------------------------------
            SIDEBAR USER
        ------------------------------------------------ */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
              {getInitial()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {getUserName()}
              </p>

              <p className="truncate text-xs text-gray-500">
                {getUserEmail()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================
          MAIN AREA
      ================================================== */}
      <div className="min-h-screen lg:pl-72">
        {/* ==================================================
            TOP HEADER
        ================================================== */}
        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-20
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white/95
            px-4
            shadow-sm
            backdrop-blur
            sm:px-6
          "
        >
          {/* ------------------------------------------------
              LEFT HEADER
          ------------------------------------------------ */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                rounded-xl
                p-2.5
                text-gray-600
                transition
                hover:bg-gray-100
                lg:hidden
              "
            >
              <Menu size={23} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {getPageTitle(location.pathname)}
              </h2>

              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your messages and communication
              </p>
            </div>
          </div>

          {/* ------------------------------------------------
              RIGHT HEADER
          ------------------------------------------------ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                p-1.5
                transition
                hover:bg-gray-100
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {getInitial()}
              </div>

              <div className="hidden text-left md:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-gray-900">
                  {getUserName()}
                </p>

                <p className="max-w-[150px] truncate text-xs text-gray-500">
                  {getUserEmail()}
                </p>
              </div>

              <ChevronDown
                size={17}
                className={`hidden text-gray-500 transition sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ------------------------------------------------
                PROFILE DROPDOWN
            ------------------------------------------------ */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />

                <div
                  className="
                    absolute
                    right-0
                    top-14
                    z-50
                    w-64
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    shadow-xl
                  "
                >
                  {/* User info */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                        {getInitial()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {getUserName()}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {getUserEmail()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="p-2">
                    <Link
                      to="/user/profile"
                      onClick={() => setProfileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-700
                        hover:bg-gray-100
                      "
                    >
                      <User size={18} />
                      Profile
                    </Link>

                    <Link
                      to="/user/settings"
                      onClick={() => setProfileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-700
                        hover:bg-gray-100
                      "
                    >
                      <Settings size={18} />
                      Settings
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        font-medium
                        text-red-600
                        hover:bg-red-50
                      "
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}
        <main className="min-h-[calc(100vh-5rem)] bg-gray-100 p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* ======================================================
   PAGE TITLE HELPER
====================================================== */

const getPageTitle = (pathname) => {
  if (pathname.includes("/inbox")) {
    return "Inbox";
  }

  if (pathname.includes("/sent")) {
    return "Sent";
  }

  if (pathname.includes("/drafts")) {
    return "Drafts";
  }

  if (pathname.includes("/trash")) {
    return "Trash";
  }

  if (pathname.includes("/compose")) {
    return "Compose";
  }

  if (pathname.includes("/profile")) {
    return "Profile";
  }

  if (pathname.includes("/settings")) {
    return "Settings";
  }

  return "Dashboard";
};

export default UserDashboard;