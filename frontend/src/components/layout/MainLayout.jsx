import React, {
    useEffect,
    useState,
} from "react";

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
import {
    getUnreadCountApi,
    searchMessagesApi,
    getMessageByIdApi,
    markMessageAsReadApi,
} from "../../api/messageApi";

import ComposeModal from "../mail/ComposeModal";
import MessageViewer from "../mail/MessageViewer";

import Hero from "../../assets/hero.png";


const MainLayout = () => {

    const {
        user,
        logout,
    } = useAuth();

    const [searchParams] =
        useSearchParams();

    const location =
        useLocation();

    const navigate =
        useNavigate();


    /* =========================================================
       STATE
    ========================================================== */

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);

    const [composeOpen, setComposeOpen] =
        useState(false);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [searchText, setSearchText] =
        useState("");

    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [searchSubmitted, setSearchSubmitted] = useState(false);

    // Global-search message viewer state
    const [searchSelectedMessage, setSearchSelectedMessage] = useState(null);
    const [searchMessageLoading, setSearchMessageLoading] = useState(false);
    const [searchMessageError, setSearchMessageError] = useState("");

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [refreshing, setRefreshing] =
        useState(false);

    const [logoutModal, setLogoutModal] =
        useState(false);

    const [currentTime, setCurrentTime] =
        useState(new Date());


    /* =========================================================
       FOLDER
    ========================================================== */

    const folder =
        (
            searchParams.get("Folder") ||
            searchParams.get("folder") ||
            "inbox"
        ).toLowerCase();


    /* =========================================================
       SESSION ID
    ========================================================== */

    useEffect(() => {

        const urlSessionId =
            searchParams.get("sessionId") ||
            searchParams.get("sessionID") ||
            searchParams.get("session_id") ||
            "";

        if (
            urlSessionId.trim()
        ) {

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

        const name =
            getUserName();

        if (!name) {
            return "U";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();

    };


    /* =========================================================
       UNREAD COUNT
    ========================================================== */

    const loadUnreadCount =
        async () => {

            try {

                const response =
                    await getUnreadCountApi();

                if (
                    response?.success
                ) {

                    const count =
                        Number(
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


    const refreshUnreadCount =
        async () => {

            try {

                setRefreshing(true);

                await loadUnreadCount();

            } finally {

                setTimeout(
                    () => {
                        setRefreshing(false);
                    },
                    500
                );

            }

        };


    useEffect(() => {

        loadUnreadCount();

        const interval =
            setInterval(
                () => {
                    loadUnreadCount();
                },
                30000
            );

        return () =>
            clearInterval(
                interval
            );

    }, []);


    /* =========================================================
       CLOCK
    ========================================================== */

    useEffect(() => {

        const timer =
            setInterval(
                () => {

                    setCurrentTime(
                        new Date()
                    );

                },
                1000
            );

        return () =>
            clearInterval(
                timer
            );

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
        location.search,
    ]);


    /* =========================================================
       KEYBOARD SHORTCUTS
    ========================================================== */

    useEffect(() => {

        const handleKeyDown =
            (event) => {

                if (
                    (
                        event.ctrlKey ||
                        event.metaKey
                    ) &&
                    event.key.toLowerCase() ===
                        "k"
                ) {

                    event.preventDefault();

                    setSearchOpen(true);

                    return;

                }


                if (
                    event.key.toLowerCase() ===
                        "c" &&
                    !event.target.matches(
                        "input, textarea, select"
                    )
                ) {

                    setSidebarOpen(false);
                    setProfileOpen(false);

                    navigate(
                        "/user/mail/compose"
                    );

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
       GET SESSION ID
    ========================================================== */

    const getSessionId = () => {

        try {

            const urlSessionId =
                searchParams.get("sessionId") ||
                searchParams.get("sessionID") ||
                searchParams.get("session_id") ||
                "";

            const storedSessionId =
                localStorage.getItem(
                    "darkmail_session_id"
                ) ||
                localStorage.getItem(
                    "sessionId"
                ) ||
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


    /* =========================================================
       BUILD MAIL URL
    ========================================================== */

    const buildMailUrl = (
        mailFolder = "inbox",
        extraParams = {}
    ) => {

        const params =
            new URLSearchParams();

        params.set(
            "Folder",
            mailFolder
        );

        const sessionId =
            getSessionId();

        // if (sessionId) {

        //     params.set(
        //         "sessionId",
        //         sessionId
        //     );

        // }

        Object.entries(
            extraParams
        ).forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                ) {

                    params.set(
                        key,
                        String(value)
                    );

                }

            }
        );

        return (
            `/user/mail?${params.toString()}`
        );

    };


    /* =========================================================
       NAVIGATION
    ========================================================== */

    const navigation = [

        {
            name: "Inbox",
            path: buildMailUrl(
                "inbox"
            ),
            folder: "inbox",
            icon: InboxIcon,
            badge: unreadCount,
        },

        {
            name: "Sent",
            path: buildMailUrl(
                "sent"
            ),
            folder: "sent",
            icon: Send,
        },

        {
            name: "Drafts",
            path: buildMailUrl(
                "drafts"
            ),
            folder: "drafts",
            icon: FileText,
        },

        {
            name: "Trash",
            path: buildMailUrl(
                "trash"
            ),
            folder: "trash",
            icon: Trash2,
        },

    ];


    /* =========================================================
       ACTIVE FOLDER
    ========================================================== */

    const isMailFolderActive =
        (itemFolder) => {

            return (
                location.pathname ===
                    "/user/mail" &&
                folder === itemFolder
            );

        };


    const isPathActive =
        (path) => {

            return (
                location.pathname ===
                path
            );

        };


    /* =========================================================
       LOGOUT
    ========================================================== */

    const confirmLogout = () => {

        setLogoutModal(false);
        setProfileOpen(false);

        logout();
        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    /* =========================================================
       SEARCH
    ========================================================== */

    const handleSearchSubmit = async (event) => {
        event.preventDefault();

        const query = searchText.trim();

        if (!query) {
            setSearchResults([]);
            setSearchError("Please enter a search keyword.");
            setSearchSubmitted(false);
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError("");
            setSearchSubmitted(true);
            setSearchResults([]);

            const response = await searchMessagesApi(query);

            if (!response?.success) {
                throw new Error(response?.message || "Unable to search messages.");
            }

            setSearchResults(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Global message search failed:", error);
            setSearchError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch messages. Please try again."
            );
        } finally {
            setSearchLoading(false);
        }
    };

    // Open search results directly in the same MessageViewer component
    // used by Inbox. Fetch the complete message before rendering it.
    const handleOpenSearchResult = async (message) => {
        const messageId = message?._id;

        if (!messageId) {
            setSearchError("This search result does not contain a valid message ID.");
            return;
        }

        setSearchOpen(false);
        setSearchText("");
        setSearchResults([]);
        setSearchError("");
        setSearchSubmitted(false);
        setSearchMessageError("");
        setSearchSelectedMessage(null);
        setSearchMessageLoading(true);

        try {
            if (!message.isRead) {
                try {
                    await markMessageAsReadApi(messageId);
                } catch (readError) {
                    console.warn("Unable to mark searched message as read:", readError);
                }
            }

            const response = await getMessageByIdApi(messageId);

            if (!response?.success) {
                throw new Error(response?.message || "Unable to load this message.");
            }

            const fullMessage = response?.data || response?.message || message;

            if (!fullMessage || typeof fullMessage !== "object") {
                throw new Error("The server returned an invalid message.");
            }

            setSearchSelectedMessage(fullMessage);
        } catch (error) {
            console.error("Unable to open searched message:", error);
            setSearchMessageError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to open this message. Please try again."
            );
        } finally {
            setSearchMessageLoading(false);
        }
    };

    const closeSearchMessageViewer = () => {
        setSearchSelectedMessage(null);
        setSearchMessageError("");
        setSearchMessageLoading(false);
    };

    const handleSearchMessageDeleted = () => {
        closeSearchMessageViewer();
        loadUnreadCount();
    };

    const handleSearchMessageUpdated = async () => {
        if (!searchSelectedMessage?._id) return;

        try {
            const response = await getMessageByIdApi(searchSelectedMessage._id);
            if (response?.success) {
                setSearchSelectedMessage(
                    response?.data || response?.message || searchSelectedMessage
                );
            }
        } catch (error) {
            console.error("Unable to refresh searched message:", error);
        }
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

    const pageTitle =
        getPageTitle(
            location.pathname,
            folder
        );


    /* =========================================================
       RENDER
    ========================================================== */

    return (

        /*
         * IMPORTANT
         * ------------------------------------------------------
         * The complete application owns the viewport height.
         * We don't allow the browser/page itself to create an
         * unwanted second scrollbar.
         */
        <div
            className="
                flex
                h-dvh
                min-h-0
                w-full
                flex-col
                overflow-hidden
                bg-gray-100
                text-gray-900
            "
        >

            {/* =================================================
                MOBILE OVERLAY
            ================================================== */}

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


            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-50
                    flex
                    h-dvh
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

                    {/* =====================================================
                        DARKMAIL BRAND
                    ===================================================== */}

                    {String(user?.role || "").toUpperCase() === "ADMIN" ? (

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin")
                            }
                            title="Go to Admin Dashboard"
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-3
                                rounded-xl
                                text-left
                                transition
                                hover:opacity-90
                                focus:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-indigo-500
                                focus-visible:ring-offset-2
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
                                    overflow-hidden
                                    rounded-xl
                                    bg-indigo-600
                                    shadow-md
                                "
                            >
                                <img
                                    src={Hero}
                                    alt="DarkMail"
                                    className="
                                        h-9
                                        w-9
                                        object-contain
                                    "
                                />
                            </div>


                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

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

                                    <span
                                        className="
                                            rounded-md
                                            bg-indigo-50
                                            px-1.5
                                            py-0.5
                                            text-[9px]
                                            font-semibold
                                            tracking-wide
                                            text-indigo-600
                                        "
                                    >
                                        v
                                        {
                                            import.meta.env
                                                .VITE_PACKAGE_VERSION ||
                                            "1.0.1"
                                        }
                                    </span>

                                </div>

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

                        </button>

                    ) : (

                        <div
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
                                    overflow-hidden
                                    rounded-xl
                                    bg-indigo-600
                                    shadow-md
                                "
                            >
                                <img
                                    src={Hero}
                                    alt="DarkMail"
                                    className="
                                        h-9
                                        w-9
                                        object-contain
                                    "
                                />
                            </div>


                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

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

                                    <span
                                        className="
                                            rounded-md
                                            bg-indigo-50
                                            px-1.5
                                            py-0.5
                                            text-[9px]
                                            font-semibold
                                            tracking-wide
                                            text-indigo-600
                                        "
                                    >
                                        v
                                        {
                                            import.meta.env
                                                .VITE_PACKAGE_VERSION ||
                                            "1.0.1"
                                        }
                                    </span>

                                </div>

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

                        </div>

                    )}


                    {/* MOBILE CLOSE */}

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
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* =================================================
                    COMPOSE
                ================================================== */}

                <div
                    className="
                        shrink-0
                        px-4
                        pt-4
                    "
                >

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
                        min-h-0
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


                    <div
                        className="
                            space-y-1
                        "
                    >

                        {navigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;

                                const active =
                                    isMailFolderActive(
                                        item.folder
                                    );

                                return (

                                    <Link
                                        key={
                                            item.name
                                        }
                                        to={
                                            item.path
                                        }
                                        onClick={() =>
                                            setSidebarOpen(
                                                false
                                            )
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

                                            <Icon
                                                size={19}
                                            />

                                            <span>
                                                {
                                                    item.name
                                                }
                                            </span>

                                        </div>


                                        {item.badge >
                                            0 && (

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
                                                {
                                                    item.badge
                                                }
                                            </span>

                                        )}

                                    </Link>

                                );

                            }
                        )}

                    </div>


                    {/* ACCOUNT */}

                    <div
                        className="
                            mt-7
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
                            Account
                        </p>


                        <Link
                            to="/user/profile"
                            onClick={() =>
                                setSidebarOpen(
                                    false
                                )
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
                                setSidebarOpen(
                                    false
                                )
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


                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >

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
                    flex
                    min-h-0
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
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
                        min-h-[70px]
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        bg-white
                        px-1
                        shadow-sm
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
                                setSidebarOpen(
                                    true
                                )
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


                        <div
                            className="
                                min-w-0
                                ml-2
                            "
                        >

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
                                Manage your messages
                                and communication
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


                        {/* TOPBAR SEARCH */}
                        <div className="relative flex items-center">
                            {!searchOpen ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(true)}
                                    title="Search messages"
                                    className="rounded-xl p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                >
                                    <Search size={19} />
                                </button>
                            ) : (
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="flex w-[min(72vw,420px)] items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 shadow-sm ring-2 ring-indigo-50"
                                >
                                    <Search size={18} className="shrink-0 text-gray-400" />
                                    <input
                                        autoFocus
                                        type="search"
                                        value={searchText}
                                        onChange={(event) => {
                                            setSearchText(event.target.value);
                                            setSearchError("");
                                            setSearchSubmitted(false);
                                        }}
                                        placeholder="Search all messages..."
                                        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                                    />
                                    {searchLoading ? (
                                        <RefreshCw size={16} className="animate-spin text-indigo-600" />
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!searchText.trim()}
                                            title="Search"
                                            className="rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Search size={17} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchOpen(false);
                                            setSearchText("");
                                            setSearchResults([]);
                                            setSearchError("");
                                            setSearchSubmitted(false);
                                        }}
                                        title="Close search"
                                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </form>
                            )}

                            {searchOpen && (searchLoading || searchError || searchSubmitted || searchText.trim()) && (
                                <div className="absolute right-0 top-full z-[120] mt-2 max-h-[min(65vh,520px)] w-[min(90vw,440px)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                                    {searchLoading && (
                                        <div className="flex items-center justify-center gap-2 p-5 text-sm text-gray-500">
                                            <RefreshCw size={16} className="animate-spin" /> Fetching messages...
                                        </div>
                                    )}
                                    {!searchLoading && searchError && (
                                        <p className="p-4 text-sm text-red-600">{searchError}</p>
                                    )}
                                    {!searchLoading && !searchError && searchSubmitted && searchResults.length === 0 && (
                                        <div className="p-6 text-center">
                                            <p className="text-sm font-medium text-gray-700">No messages found</p>
                                            <p className="mt-1 text-xs text-gray-400">Try another keyword.</p>
                                        </div>
                                    )}
                                    {!searchLoading && searchResults.length > 0 && (
                                        <>
                                            <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                                                {searchResults.length} message{searchResults.length === 1 ? "" : "s"} found
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {searchResults.map((message) => {
                                                    const senderName = message.sender?.name || message.sender?.email || "Unknown sender";
                                                    const preview = String(message.body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                                                    const messageDate = message.sentAt || message.createdAt;
                                                    return (
                                                        <button
                                                            key={message._id}
                                                            type="button"
                                                            onClick={() => handleOpenSearchResult(message)}
                                                            className="block w-full px-4 py-3 text-left transition hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-gray-900">{message.subject || "(No subject)"}</p>
                                                                    <p className="mt-1 truncate text-xs text-gray-500">{senderName}</p>
                                                                    {preview && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{preview}</p>}
                                                                </div>
                                                                <div className="shrink-0 text-right">
                                                                    <span className="inline-block rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold capitalize text-indigo-700">{String(message.folder || message.status || "message").toLowerCase()}</span>
                                                                    {messageDate && <p className="mt-1 text-[10px] text-gray-400">{new Date(messageDate).toLocaleDateString()}</p>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>


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

                        <div
                            className="
                                relative
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationOpen(
                                        (prev) =>
                                            !prev
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

                                {unreadCount >
                                    0 && (

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
                                                    {
                                                        unreadCount
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <div
                                            className="
                                                p-4
                                            "
                                        >

                                            {unreadCount >
                                                0 ? (

                                                <button
                                                    type="button"
                                                    onClick={() => {

                                                        setNotificationOpen(
                                                            false
                                                        );

                                                        navigate(
                                                            buildMailUrl(
                                                                "inbox"
                                                            )
                                                        );

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
                                                        transition
                                                        hover:bg-indigo-100
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-indigo-600
                                                            text-white
                                                        "
                                                    >
                                                        <Bell
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>


                                                    <div>

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-gray-900
                                                            "
                                                        >
                                                            New
                                                            messages
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-gray-500
                                                            "
                                                        >
                                                            You
                                                            have{" "}
                                                            {
                                                                unreadCount
                                                            }{" "}
                                                            unread
                                                            message
                                                            {
                                                                unreadCount ===
                                                                1
                                                                    ? ""
                                                                    : "s"
                                                            }.
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

                                                    <Bell
                                                        size={
                                                            24
                                                        }
                                                        className="
                                                            mx-auto
                                                            text-gray-300
                                                        "
                                                    />

                                                    <p
                                                        className="
                                                            mt-2
                                                            text-sm
                                                            text-gray-500
                                                        "
                                                    >
                                                        No new
                                                        notifications
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </>

                            )}

                        </div>


                        {/* PROFILE */}

                        <div
                            className="
                                relative
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        (prev) =>
                                            !prev
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    p-1
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
                                        shrink-0
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
                                                    {
                                                        getInitials()
                                                    }
                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-semibold
                                                            text-gray-900
                                                        "
                                                    >
                                                        {
                                                            getUserName()
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                            truncate
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        {
                                                            getUserEmail()
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <div
                                            className="
                                                p-2
                                            "
                                        >

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

                                                <User
                                                    size={18}
                                                />

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

                                                    setLogoutModal(
                                                        true
                                                    );

                                                }}
                                                className="
                                                    mt-1
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
                    MOBILE QUICK ACTIONS
                ================================================== */}

                <div
                    className="
                        shrink-0
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
                            items-center
                            gap-2
                            overflow-x-auto
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                setComposeOpen(
                                    true
                                )
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                bg-indigo-600
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                            "
                        >

                            <PenSquare
                                size={15}
                            />

                            Compose

                        </button>


                        <Link
                            to="/user/profile"
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-gray-200
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-600
                            "
                        >

                            <User
                                size={15}
                            />

                            Profile

                        </Link>


                        <Link
                            to="/user/settings"
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-gray-200
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-600
                            "
                        >

                            <Settings
                                size={15}
                            />

                            Settings

                        </Link>

                    </div>

                </div>


                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <main
                    className="
                        min-h-0
                        min-w-0
                        flex-1
                        overflow-x-hidden
                        overflow-y-auto
                        bg-gray-100
                        p-0
                    "
                >

                    <Outlet />

                </main>

            </div>


            {/* =====================================================
                GLOBAL SEARCH MESSAGE VIEWER
            ====================================================== */}
            {(searchMessageLoading || searchMessageError || searchSelectedMessage) && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
                    <div
                        className="relative flex h-[min(92dvh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {searchMessageLoading ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-gray-500">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                                Loading message...
                            </div>
                        ) : searchMessageError ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                                <p className="text-sm text-red-600">{searchMessageError}</p>
                                <button
                                    type="button"
                                    onClick={closeSearchMessageViewer}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <MessageViewer
                                message={searchSelectedMessage}
                                onClose={closeSearchMessageViewer}
                                onMessageDeleted={handleSearchMessageDeleted}
                                onMessageUpdated={handleSearchMessageUpdated}
                                showCloseButton={true}
                            />
                        )}
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
                        z-[110]
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        px-4
                        backdrop-blur-sm
                    "
                    onClick={() =>
                        setLogoutModal(false)
                    }
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
                        onClick={(event) =>
                            event.stopPropagation()
                        }
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
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-100
                                    text-red-600
                                "
                            >
                                <LogOut
                                    size={20}
                                />
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
                                mt-5
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
                                    setLogoutModal(
                                        false
                                    )
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


            {/* =====================================================
                COMPOSE MODAL
            ====================================================== */}

            <ComposeModal
                open={
                    composeOpen
                }
                onClose={() =>
                    setComposeOpen(
                        false
                    )
                }
                onSent={() =>
                    setComposeOpen(
                        false
                    )
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

    if (
        pathname ===
        "/user/mail"
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
        pathname.includes(
            "/user/mail/compose"
        )
    ) {
        return "Compose";
    }


    if (
        pathname.includes(
            "/profile"
        )
    ) {
        return "Profile";
    }


    if (
        pathname.includes(
            "/settings"
        )
    ) {
        return "Settings";
    }


    return "Dashboard";

};


export default MainLayout;