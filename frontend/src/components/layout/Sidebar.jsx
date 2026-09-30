import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import ComposeModal from "../mail/ComposeModal";

const Sidebar = ({ mobile = false, onClose }) => {
    const { user, logout } = useAuth();

    const [composeOpen, setComposeOpen] = useState(false);

    const menuItems = [
        {
            label: "Inbox",
            path: "/user/inbox",
            icon: "📥"
        },
        {
            label: "Sent",
            path: "/user/sent",
            icon: "📤"
        },
        {
            label: "Drafts",
            path: "/user/drafts",
            icon: "📝"
        },
        {
            label: "Trash",
            path: "/user/trash",
            icon: "🗑️"
        },
        {
            label: "Dashboard",
            path: "/user/me",
            icon: ""
        }
    ];

    const handleLogout = () => {
        logout();

        if (onClose) {
            onClose();
        }
    };

    const handleCompose = () => {
        setComposeOpen(true);
    };

    const handleComposeClose = () => {
        setComposeOpen(false);
    };

    return (
        <>
            <aside className="flex h-full w-64 flex-col bg-slate-950 text-white">

                {/* =====================================================
                    LOGO
                ====================================================== */}

                <div className="flex h-16 items-center border-b border-slate-800 px-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
                        D
                    </div>

                    <div className="ml-3">
                        <h1 className="text-lg font-bold">
                            DarkMail
                        </h1>

                        <p className="text-[11px] text-slate-400">
                            Internal Mail
                        </p>
                    </div>

                    {mobile && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            aria-label="Close sidebar"
                        >
                            ✕
                        </button>
                    )}

                </div>

                {/* =====================================================
                    COMPOSE
                ====================================================== */}

                <div className="p-4">

                    <button
                        type="button"
                        onClick={() => setComposeOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700"
                    >
                        <span>＋</span>
                        Compose
                    </button>


                </div>

                {/* =====================================================
                    NAVIGATION
                ====================================================== */}

                <nav className="flex-1 px-3">

                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mail
                    </p>

                    <div className="space-y-1">

                        {menuItems.map((item) => (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/user"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                                        isActive
                                            ? "bg-blue-600/20 text-blue-400"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >

                                <span className="w-6 text-center">
                                    {item.icon}
                                </span>

                                <span>
                                    {item.label}
                                </span>

                            </NavLink>

                        ))}

                    </div>

                </nav>

                {/* =====================================================
                    USER
                ====================================================== */}

                <div className="border-t border-slate-800 p-4">

                    <div className="mb-3 flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-sm font-medium">
                                {user?.name || "User"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                                {user?.email || ""}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>

            {/* =========================================================
                COMPOSE MODAL
            ========================================================== */}

            <ComposeModal
                open={composeOpen}
                onClose={() => setComposeOpen(false)}
                onSent={() => {
                    setComposeOpen(false);
                }}
            />

        </>
    );
};

export default Sidebar;
