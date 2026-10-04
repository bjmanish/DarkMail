import React, { useEffect, useState } from "react";

import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

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
    Search,
    Bell,
    RefreshCw,
    Clock,
    ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getUnreadCountApi } from "../../api/messageApi";

import ComposeModal from "../mail/ComposeModal";

const MainLayout = () => {

    const {
        user,
        logout,
    } = useAuth();

    const [searchParams] = useSearchParams();

    const location = useLocation();
    const navigate = useNavigate();

    /* =========================================================
       STATE
    ========================================================== */

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);


    const [composeOpen, setComposeOpen] = useState(false);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [searchText, setSearchText] =
        useState("");

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [refreshing, setRefreshing] =
        useState(false);

    const [logoutModal, setLogoutModal] =
        useState(false);

    const [currentTime, setCurrentTime] =
        useState(new Date());

    /*
     * IMPORTANT
     * Read Folder from:
     *
     * /user/mail?Folder=inbox
     * /user/mail?Folder=sent
     * /user/mail?Folder=drafts
     * /user/mail?Folder=trash
     */

    const folder =
        (
            searchParams.get("Folder") ||
            searchParams.get("folder") ||
            "inbox"
        ).toLowerCase();

    /*
     * Keep the current sessionId available for all mailbox links.
     * The URL remains the source for navigation, while localStorage
     * keeps it when the user changes Folder.
     */
    useEffect(() => {

        const urlSessionId =
            searchParams.get("sessionId") ||
            searchParams.get("sessionID") ||
            searchParams.get("session_id") ||
            "";

        if (urlSessionId.trim()) {

            try {

                localStorage.setItem(
                    "darkmail_session_id",
                    urlSessionId.trim()
                );

            } catch (error) {

                console.warn(
                    "Unable to store sessionId:",
                    error
                );
            }
        }

    }, [searchParams]);

    /* =========================================================
       USER DATA
    ========================================================== */

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

        return (
            user?.email ||
            user?.emailAddress ||
            ""
        );
    };

    const getUserRole = () => {

        return (
            user?.role ||
            user?.roleName ||
            "USER"
        );
    };

    const getInitials = () => {

        const name = getUserName();

        if (!name) {
            return "U";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map((word) =>
                word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    /* =========================================================
       UNREAD COUNT
    ========================================================== */

    const loadUnreadCount = async () => {

        try {

            const response =
                await getUnreadCountApi();

            if (response?.success) {

                const count = Number(
                    response?.count ??
                    response?.unreadCount ??
                    response?.data?.count ??
                    response?.data?.unreadCount ??
                    0
                );

                setUnreadCount(
                    Number.isFinite(count)
                        ? count
                        : 0
                );
            }

        } catch (error) {

            console.error(
                "Failed to load unread count:",
                error
            );
        }
    };

    const refreshUnreadCount = async () => {

        try {

            setRefreshing(true);

            await loadUnreadCount();

        } finally {

            setTimeout(() => {

                setRefreshing(false);

            }, 500);
        }
    };

    useEffect(() => {

        loadUnreadCount();

        const interval =
            setInterval(() => {

                loadUnreadCount();

            }, 30000);

        return () =>
            clearInterval(interval);

    }, []);

    /* =========================================================
       CLOCK
    ========================================================== */

    useEffect(() => {

        const timer =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 1000);

        return () =>
            clearInterval(timer);

    }, []);

    /* =========================================================
       CLOSE MOBILE MENUS
    ========================================================== */

    useEffect(() => {

        setSidebarOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);

    }, [
        location.pathname,
        location.search
    ]);

    /* =========================================================
       KEYBOARD SHORTCUTS
    ========================================================== */

    useEffect(() => {

        const handleKeyDown = (event) => {

            /*
             * CTRL + K
             * Search
             */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                setSearchOpen(true);

                return;
            }

            /*
             * C
             * Compose
             */

            if (
                event.key.toLowerCase() === "c" &&
                !event.target.matches(
                    "input, textarea, select"
                )
            ) {

                setSidebarOpen(false);
                setProfileOpen(false);
                navigate("/user/mail/compose");
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [navigate]);

    /* =========================================================
       MAIL SESSION / URL
    ========================================================== */

    const getSessionId = () => {

        try {
            /*
             * Priority:
             * 1. sessionId already present in the current URL
             * 2. darkmail_session_id saved after login
             * 3. sessionId saved after login
             */
            const urlSessionId =
                searchParams.get("sessionId") ||
                searchParams.get("sessionID") ||
                searchParams.get("session_id") ||
                "";

            const storedSessionId =
                localStorage.getItem("darkmail_session_id") ||
                localStorage.getItem("sessionId") ||
                "";

            return (
                urlSessionId ||
                storedSessionId ||
                ""
            ).trim();

        } catch (error) {

            console.warn(
                "Unable to read sessionId:",
                error
            );

            return "";
        }
    };

    const buildMailUrl = (mailFolder = "inbox", extraParams = {}) => {

        const params = new URLSearchParams();
        params.set("Folder", mailFolder);

        const sessionId = getSessionId();

        if (sessionId) {
            params.set("sessionId", sessionId);
        }

        Object.entries(extraParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                params.set(key, String(value));
            }
        });

        return `/user/mail?${params.toString()}`;
    };

    /* =========================================================
       NAVIGATION
    ========================================================== */

    const navigation = [

        {
            name: "Inbox",
            path: buildMailUrl("inbox"),
            folder: "inbox",
            icon: InboxIcon,
            badge: unreadCount,
        },

        {
            name: "Sent",
            path: buildMailUrl("sent"),
            folder: "sent",
            icon: Send,
        },

        {
            name: "Drafts",
            path: buildMailUrl("drafts"),
            folder: "drafts",
            icon: FileText,
        },

        {
            name: "Trash",
            path: buildMailUrl("trash"),
            folder: "trash",
            icon: Trash2,
        },

    ];

    /* =========================================================
       ACTIVE MAIL FOLDER
    ========================================================== */

    const isMailFolderActive = (itemFolder) => {

        return (
            location.pathname === "/user/mail" &&
            folder === itemFolder
        );
    };

    const isPathActive = (path) => {

        return location.pathname === path;
    };

    /* =========================================================
       LOGOUT
    ========================================================== */

    const confirmLogout = () => {

        setLogoutModal(false);
        setProfileOpen(false);

        logout();
    };

    /* =========================================================
       SEARCH
    ========================================================== */

    const handleSearchSubmit = (event) => {

        event.preventDefault();

        const query =
            searchText.trim();

        if (!query) {
            return;
        }

        navigate(
            buildMailUrl("inbox", {
                search: query,
            })
        );

        setSearchOpen(false);
        setSearchText("");
    };

    /* =========================================================
       TIME
    ========================================================== */

    const formattedTime =
        currentTime.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }
        );

    /* =========================================================
       PAGE TITLE
    ========================================================== */

    const pageTitle = getPageTitle(
        location.pathname,
        folder
    );

    /* =========================================================
       RENDER
    ========================================================== */

    return (

        <div
            className="
                min-h-screen
                overflow-x-hidden
                bg-gray-100
                text-gray-900
            "
        >

            {/* =====================================================
                MOBILE OVERLAY
            ====================================================== */}

            {sidebarOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/50
                        backdrop-blur-sm
                        lg:hidden
                    "
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-50
                    flex
                    h-screen
                    w-[280px]
                    max-w-[85vw]
                    flex-col
                    border-r
                    border-gray-200
                    bg-white
                    shadow-xl
                    transition-transform
                    duration-300
                    ease-in-out

                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }

                    lg:translate-x-0
                `}
            >

                {/* =================================================
                    LOGO
                ================================================== */}

                <div
                    className="
                        flex
                        h-[76px]
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        px-4
                        sm:px-5
                    "
                >

                    <h2
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-600
                                text-white
                                shadow-md
                            "
                        >
                            {/* <Mail size={23} /> */}
                            <img src="../../src/assets/Hero.png" size="25"/>
                        </div>

                        <div className="min-w-0">

                            <h1
                                className="
                                    truncate
                                    text-lg
                                    font-bold
                                    tracking-tight
                                    text-gray-900
                                "
                            >
                                DarkMail
                            </h1>

                            <p
                                className="
                                    truncate
                                    text-[11px]
                                    text-gray-500
                                "
                            >
                                Internal Mail System
                            </p>

                        </div>

                    </h2>

                    {/* Mobile Close */}

                    <button
                        type="button"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                        className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition
                            hover:bg-gray-100
                            lg:hidden
                        "
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* =================================================
                    COMPOSE
                ================================================== */}

                <div className="px-4 pt-4">

                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            setComposeOpen(true);
                        }}
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
                            text-sm
                            font-semibold
                            text-white
                            shadow-md
                            transition
                            hover:bg-indigo-700
                            hover:shadow-lg
                            active:scale-[0.98]
                        "
                    >
                        <PenSquare size={18} />

                        <span>
                            Compose
                        </span>
                    </button>

                </div>

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <nav
                    className="
                        mt-5
                        flex-1
                        overflow-y-auto
                        px-3
                        pb-4
                    "
                >

                    <p
                        className="
                            mb-2
                            px-3
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-gray-400
                        "
                    >
                        Mail
                    </p>

                    <div className="space-y-1">

                        {navigation.map((item) => {

                            const Icon = item.icon;

                            const active =
                                isMailFolderActive(item.folder);

                            return (

                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() =>
                                        setSidebarOpen(false)
                                    }
                                    className={`
                                        flex
                                        items-center
                                        justify-between
                                        rounded-xl
                                        px-4
                                        py-3
                                        transition

                                        ${
                                            active
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }
                                    `}
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <Icon size={19} />

                                        <span>
                                            {item.name}
                                        </span>

                                    </div>


                                    {item.badge > 0 && (

                                        <span
                                            className="
                                                rounded-full
                                                bg-indigo-600
                                                px-2
                                                py-0.5
                                                text-xs
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {item.badge}
                                        </span>

                                    )}

                                </Link>
                            );
                        })}

                    </div>

                    {/* =================================================
                        ACCOUNT
                    ================================================== */}

                    <div className="mt-7">

                        <p
                            className="
                                mb-2
                                px-3
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-wider
                                text-gray-400
                            "
                        >
                            Account
                        </p>

                        <Link
                            to="/user/profile"
                            onClick={() =>
                                setSidebarOpen(false)
                            }
                            className={`
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                text-sm
                                font-medium
                                transition

                                ${
                                    isPathActive(
                                        "/user/profile"
                                    )
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }
                            `}
                        >

                            <User size={19} />

                            Profile

                        </Link>

                        <Link
                            to="/user/settings"
                            onClick={() =>
                                setSidebarOpen(false)
                            }
                            className={`
                                mt-1
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                text-sm
                                font-medium
                                transition

                                ${
                                    isPathActive(
                                        "/user/settings"
                                    )
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }
                            `}
                        >

                            <Settings size={19} />

                            Settings

                        </Link>

                    </div>

                </nav>

                {/* =================================================
                    SIDEBAR USER
                ================================================== */}

                <div
                    className="
                        shrink-0
                        border-t
                        border-gray-200
                        p-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            bg-gray-50
                            p-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-600
                                text-sm
                                font-bold
                                text-white
                            "
                        >
                            {getInitials()}
                        </div>

                        <div className="min-w-0 flex-1">

                            <p
                                className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {getUserName()}
                            </p>

                            <p
                                className="
                                    truncate
                                    text-[11px]
                                    text-gray-500
                                "
                            >
                                {getUserEmail()}
                            </p>

                        </div>

                    </div>

                </div>

            </aside>

            {/* =====================================================
                MAIN AREA
            ====================================================== */}

            <div
                className="
                    min-h-screen
                    lg:pl-[280px]
                "
            >

                {/* =================================================
                    TOP HEADER
                ================================================== */}

                <header
                    className="
                        sticky
                        top-0
                        z-30
                        flex
                        min-h-[76px]
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        bg-white/100
                        px-3
                        shadow-sm
                        backdrop-blur
                        sm:px-5
                        lg:px-6
                        
                    "
                >

                    {/* LEFT */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                            sm:gap-3
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                setSidebarOpen(true)
                            }
                            className="
                                shrink-0
                                rounded-xl
                                p-2.5
                                text-gray-600
                                transition
                                hover:bg-gray-100
                                lg:hidden
                            "
                        >
                            <Menu size={22} />
                        </button>

                        <div className="min-w-0">

                            <h2
                                className="
                                    truncate
                                    text-base
                                    font-bold
                                    text-gray-900
                                    sm:text-xl
                                "
                            >
                                {pageTitle}
                            </h2>

                            <p
                                className="
                                    hidden
                                    text-xs
                                    text-gray-500
                                    sm:block
                                "
                            >
                                Manage your messages and communication
                            </p>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                            sm:gap-2
                        "
                    >

                        {/* TIME */}

                        <div
                            className="
                                hidden
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2
                                text-xs
                                text-gray-500
                                md:flex
                            "
                        >

                            <Clock size={15} />

                            {formattedTime}

                        </div>

                        {/* SEARCH */}

                        <button
                            type="button"
                            onClick={() =>
                                setSearchOpen(true)
                            }
                            title="Search"
                            className="
                                rounded-xl
                                p-2.5
                                text-gray-500
                                transition
                                hover:bg-gray-100
                                hover:text-gray-900
                            "
                        >
                            <Search size={19} />
                        </button>

                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={
                                refreshUnreadCount
                            }
                            title="Refresh"
                            className="
                                hidden
                                rounded-xl
                                p-2.5
                                text-gray-500
                                transition
                                hover:bg-gray-100
                                hover:text-gray-900
                                sm:block
                            "
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                        </button>

                        {/* NOTIFICATION */}

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationOpen(
                                        (prev) => !prev
                                    )
                                }
                                title="Notifications"
                                className="
                                    relative
                                    rounded-xl
                                    p-2.5
                                    text-gray-500
                                    transition
                                    hover:bg-gray-100
                                "
                            >

                                <Bell size={19} />

                                {unreadCount > 0 && (

                                    <span
                                        className="
                                            absolute
                                            right-1.5
                                            top-1.5
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-red-500
                                            ring-2
                                            ring-white
                                        "
                                    />

                                )}

                            </button>

                            {notificationOpen && (

                                <>

                                    <div
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                        "
                                        onClick={() =>
                                            setNotificationOpen(
                                                false
                                            )
                                        }
                                    />

                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-12
                                            z-50
                                            w-[300px]
                                            max-w-[calc(100vw-24px)]
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            shadow-xl
                                        "
                                    >

                                        <div
                                            className="
                                                border-b
                                                border-gray-200
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >

                                                <h3
                                                    className="
                                                        text-sm
                                                        font-bold
                                                        text-gray-900
                                                    "
                                                >
                                                    Notifications
                                                </h3>

                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-indigo-50
                                                        px-2
                                                        py-1
                                                        text-[10px]
                                                        font-bold
                                                        text-indigo-600
                                                    "
                                                >
                                                    {unreadCount}
                                                </span>

                                            </div>

                                        </div>

                                        <div className="p-4">

                                            {unreadCount > 0 ? (

                                                <button
                                                    type="button"
                                                    onClick={() => {

                                                        setNotificationOpen(
                                                            false
                                                        );

                                                        navigate(buildMailUrl("inbox"));
                                                    }}
                                                    className="
                                                        flex
                                                        w-full
                                                        items-start
                                                        gap-3
                                                        rounded-xl
                                                        bg-indigo-50
                                                        p-3
                                                        text-left
                                                    "
                                                >

                                                    <InboxIcon
                                                        size={19}
                                                        className="
                                                            mt-0.5
                                                            shrink-0
                                                            text-indigo-600
                                                        "
                                                    />

                                                    <div>

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-gray-900
                                                            "
                                                        >
                                                            You have unread
                                                            messages
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-gray-500
                                                            "
                                                        >
                                                            Open your inbox
                                                            to read them.
                                                        </p>

                                                    </div>

                                                </button>

                                            ) : (

                                                <div
                                                    className="
                                                        py-5
                                                        text-center
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            mx-auto
                                                            mb-2
                                                            flex
                                                            h-10
                                                            w-10
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-gray-100
                                                        "
                                                    >
                                                        <Bell
                                                            size={18}
                                                            className="
                                                                text-gray-400
                                                            "
                                                        />
                                                    </div>

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-gray-700
                                                        "
                                                    >
                                                        All caught up
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        No new notifications.
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </>
                            )}

                        </div>

                        {/* PROFILE */}

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        (prev) => !prev
                                    )
                                }
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

                                <div
                                    className="
                                        relative
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-indigo-600
                                        text-xs
                                        font-bold
                                        text-white
                                        sm:h-10
                                        sm:w-10
                                    "
                                >

                                    {getInitials()}

                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            right-0
                                            h-2.5
                                            w-2.5
                                            rounded-full
                                            border-2
                                            border-white
                                            bg-green-500
                                        "
                                    />

                                </div>

                                <div
                                    className="
                                        hidden
                                        text-left
                                        md:block
                                    "
                                >

                                    <p
                                        className="
                                            max-w-[140px]
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        {getUserName()}
                                    </p>

                                    <p
                                        className="
                                            max-w-[140px]
                                            truncate
                                            text-[11px]
                                            text-gray-500
                                        "
                                    >
                                        {getUserRole()}
                                    </p>

                                </div>

                                <ChevronDown
                                    size={16}
                                    className={`
                                        hidden
                                        text-gray-500
                                        transition
                                        sm:block

                                        ${
                                            profileOpen
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />

                            </button>

                            {/* PROFILE DROPDOWN */}

                            {profileOpen && (

                                <>

                                    <div
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                        "
                                        onClick={() =>
                                            setProfileOpen(
                                                false
                                            )
                                        }
                                    />

                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-14
                                            z-50
                                            w-64
                                            max-w-[calc(100vw-24px)]
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            shadow-xl
                                        "
                                    >

                                        <div
                                            className="
                                                border-b
                                                border-gray-200
                                                p-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-indigo-600
                                                        font-bold
                                                        text-white
                                                    "
                                                >
                                                    {getInitials()}
                                                </div>

                                                <div className="min-w-0">

                                                    <p
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-semibold
                                                            text-gray-900
                                                        "
                                                    >
                                                        {getUserName()}
                                                    </p>

                                                    <p
                                                        className="
                                                            truncate
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        {getUserEmail()}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="p-2">

                                            <Link
                                                to="/user/profile"
                                                onClick={() =>
                                                    setProfileOpen(
                                                        false
                                                    )
                                                }
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
                                                    transition
                                                    hover:bg-gray-100
                                                "
                                            >

                                                <User size={18} />

                                                Profile

                                            </Link>

                                            <Link
                                                to="/user/settings"
                                                onClick={() =>
                                                    setProfileOpen(
                                                        false
                                                    )
                                                }
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
                                                    transition
                                                    hover:bg-gray-100
                                                "
                                            >

                                                <Settings
                                                    size={18}
                                                />

                                                Settings

                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setProfileOpen(
                                                        false
                                                    );

                                                    navigate(
                                                        "/user/profile"
                                                    );
                                                }}
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
                                                    text-gray-700
                                                    transition
                                                    hover:bg-gray-100
                                                "
                                            >

                                                <ShieldCheck
                                                    size={18}
                                                />

                                                Security

                                            </button>

                                            <div
                                                className="
                                                    my-2
                                                    border-t
                                                    border-gray-100
                                                "
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setLogoutModal(
                                                        true
                                                    )
                                                }
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
                                                    transition
                                                    hover:bg-red-50
                                                "
                                            >

                                                <LogOut
                                                    size={18}
                                                />

                                                Logout

                                            </button>

                                        </div>

                                    </div>

                                </>
                            )}

                        </div>

                    </div>

                </header>

                {/* =================================================
                    QUICK MOBILE ACTIONS
                ================================================== */}

                <div
                    className="
                        border-b
                        border-gray-200
                        bg-white
                        px-3
                        py-2
                        sm:hidden
                    "
                >

                    <div
                        className="
                            flex
                            gap-2
                            overflow-x-auto
                        "
                    >

                        <Link
                            to="/user/mail/compose"
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-xl
                                bg-indigo-600
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                            "
                        >

                            <PenSquare size={15} />

                            Compose

                        </Link>

                        <Link
                            to={buildMailUrl("inbox")}
                            className={`
                                flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-xl
                                border
                                px-3
                                py-2
                                text-xs
                                font-medium

                                ${
                                    folder === "inbox"
                                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 bg-white text-gray-700"
                                }
                            `}
                        >

                            <InboxIcon size={15} />

                            Inbox

                            {unreadCount > 0 && (

                                <span
                                    className="
                                        rounded-full
                                        bg-red-500
                                        px-1.5
                                        text-[10px]
                                        font-bold
                                        text-white
                                    "
                                >
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>

                            )}

                        </Link>

                        <Link
                            to={buildMailUrl("sent")}
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >

                            <Send size={15} />

                            Sent

                        </Link>

                        <Link
                            to={buildMailUrl("drafts")}
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >

                            <FileText size={15} />

                            Drafts

                        </Link>

                        <Link
                            to={buildMailUrl("trash")}
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >

                            <Trash2 size={15} />

                            Trash

                        </Link>

                    </div>

                </div>

                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <main
                    className="
                        min-h-[calc(100vh-72px)]
                        bg-gray-100
                        p-3
                        sm:p-5
                        lg:p-6
                    "
                >

                    <Outlet />

                </main>

            </div>

            {/* =====================================================
                SEARCH MODAL
            ====================================================== */}

            {searchOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-start
                        justify-center
                        bg-black/50
                        p-3
                        pt-[10vh]
                        sm:p-6
                        sm:pt-[15vh]
                    "
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSearchOpen(false);
                        }

                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-2xl
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        <form
                            onSubmit={
                                handleSearchSubmit
                            }
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    border-b
                                    border-gray-200
                                    px-4
                                    py-4
                                "
                            >

                                <Search
                                    size={21}
                                    className="
                                        shrink-0
                                        text-gray-400
                                    "
                                />

                                <input
                                    autoFocus
                                    type="text"
                                    value={searchText}
                                    onChange={(event) =>
                                        setSearchText(
                                            event.target.value
                                        )
                                    }
                                    placeholder="
                                        Search messages...
                                    "
                                    className="
                                        min-w-0
                                        flex-1
                                        bg-transparent
                                        text-base
                                        text-gray-900
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchOpen(
                                            false
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-400
                                        hover:bg-gray-100
                                    "
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-2
                                    bg-gray-50
                                    px-4
                                    py-3
                                    text-xs
                                    text-gray-500
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <span>
                                    Search by subject,
                                    sender or content
                                </span>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <kbd
                                        className="
                                            rounded
                                            border
                                            border-gray-300
                                            bg-white
                                            px-1.5
                                            py-0.5
                                        "
                                    >
                                        Ctrl
                                    </kbd>

                                    <span>+</span>

                                    <kbd
                                        className="
                                            rounded
                                            border
                                            border-gray-300
                                            bg-white
                                            px-1.5
                                            py-0.5
                                        "
                                    >
                                        K
                                    </kbd>

                                </div>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =====================================================
                LOGOUT MODAL
            ====================================================== */}

            {logoutModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-sm
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                mb-5
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-100
                                    text-red-600
                                "
                            >
                                <LogOut size={20} />
                            </div>

                            <div>

                                <h3
                                    className="
                                        text-base
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    Logout
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    Are you sure you want
                                    to logout?
                                </p>

                            </div>

                        </div>

                        <div
                            className="
                                flex
                                flex-col-reverse
                                gap-2
                                sm:flex-row
                                sm:justify-end
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setLogoutModal(false)
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-gray-300
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    confirmLogout
                                }
                                className="
                                    rounded-xl
                                    bg-red-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    hover:bg-red-700
                                "
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <ComposeModal
                open={composeOpen}
                onClose={() =>
                    setComposeOpen(false)
                }
                onSent={() =>
                    setComposeOpen(false)
                }
            />
        
        </div>
    );
};


/* ================================================================
   PAGE TITLE
================================================================ */

const getPageTitle = (
    pathname,
    folder
) => {

    /*
     * New mailbox route
     *
     * /user/mail?Folder=inbox
     * /user/mail?Folder=sent
     * /user/mail?Folder=drafts
     * /user/mail?Folder=trash
     */

    if (
        pathname === "/user/mail"
    ) {

        switch (folder) {

            case "inbox":
                return "Inbox";

            case "sent":
                return "Sent";

            case "drafts":
                return "Drafts";

            case "trash":
                return "Trash";

            default:
                return "Inbox";
        }
    }

    if (
        pathname.includes("/user/mail/compose")
    ) {
        return "Compose";
    }

    if (
        pathname.includes("/profile")
    ) {
        return "Profile";
    }

    if (
        pathname.includes("/settings")
    ) {
        return "Settings";
    }

    return "Dashboard";
};

export default MainLayout;