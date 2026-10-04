import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import {
    useTheme
} from "../../context/ThemeContext";

import {
    changePasswordApi
} from "../../api/authApi";


// ======================================================
// DEFAULT SETTINGS
// ======================================================

const DEFAULT_SETTINGS = {
    emailNotifications: true,
    newMailNotifications: true,
    messageReadNotifications: false,
    desktopNotifications: true,
    soundNotifications: true,

    compactMode: false,
    showAvatars: true,
    autoMarkRead: true,
    autoSaveDrafts: true,

    showOnlineStatus: true,
    showReadStatus: true,

    language: "English",
    timezone: "Asia/Kolkata"
};

const SETTINGS_STORAGE_KEY =
    "darkmail_settings";


// ======================================================
// SETTINGS PAGE
// ======================================================

const Settings = () => {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    const {
        theme,
        isDark,
        isLight,
        setTheme,
        toggleTheme
    } = useTheme();


    // ==================================================
    // SETTINGS STATE
    // ==================================================

    const [settings, setSettings] =
        useState(DEFAULT_SETTINGS);


    // ==================================================
    // ACTIVE SECTION
    // ==================================================

    const [activeSection, setActiveSection] =
        useState("general");


    // ==================================================
    // MESSAGES
    // ==================================================

    const [saveMessage, setSaveMessage] =
        useState("");

    const [saveError, setSaveError] =
        useState("");


    // ==================================================
    // PASSWORD MODAL
    // ==================================================

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [passwordData, setPasswordData] =
        useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    const [passwordLoading, setPasswordLoading] =
        useState(false);


    // ==================================================
    // LOGOUT MODAL
    // ==================================================

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);


    // ==================================================
    // MOBILE SECTION MENU
    // ==================================================

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


    // ==================================================
    // LOAD SETTINGS
    // ==================================================

    useEffect(() => {

        try {

            const savedSettings =
                localStorage.getItem(
                    SETTINGS_STORAGE_KEY
                );

            if (savedSettings) {

                const parsedSettings =
                    JSON.parse(savedSettings);

                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...parsedSettings
                });
            }

        } catch (error) {

            console.error(
                "Unable to load DarkMail settings:",
                error
            );

        }

    }, []);


    // ==================================================
    // UPDATE SETTING
    // ==================================================

    const updateSetting = (
        key,
        value
    ) => {

        setSettings((previous) => ({
            ...previous,
            [key]: value
        }));

        setSaveMessage("");
        setSaveError("");
    };


    // ==================================================
    // SAVE SETTINGS
    // ==================================================

    const saveSettings = () => {

        try {

            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(settings)
            );

            setSaveError("");

            setSaveMessage(
                "Settings saved successfully."
            );

            setTimeout(() => {

                setSaveMessage("");

            }, 3000);

        } catch (error) {

            console.error(
                "Save settings error:",
                error
            );

            setSaveError(
                "Unable to save settings."
            );
        }
    };


    // ==================================================
    // RESET SETTINGS
    // ==================================================

    const resetSettings = () => {

        try {

            setSettings({
                ...DEFAULT_SETTINGS
            });

            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(
                    DEFAULT_SETTINGS
                )
            );

            // Reset theme
            setTheme("light");

            setSaveError("");

            setSaveMessage(
                "All settings have been restored to default."
            );

            setTimeout(() => {

                setSaveMessage("");

            }, 3000);

        } catch (error) {

            console.error(
                "Reset settings error:",
                error
            );

            setSaveError(
                "Unable to reset settings."
            );
        }
    };


    // ==================================================
    // OPEN PASSWORD MODAL
    // ==================================================

    const openPasswordModal = () => {

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        setPasswordError("");
        setPasswordSuccess("");

        setShowPasswordModal(true);
    };


    // ==================================================
    // CLOSE PASSWORD MODAL
    // ==================================================

    const closePasswordModal = () => {

        if (passwordLoading) {
            return;
        }

        setShowPasswordModal(false);

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        setPasswordError("");
        setPasswordSuccess("");
    };


    // ==================================================
    // PASSWORD INPUT
    // ==================================================

    const handlePasswordChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value
        }));

        setPasswordError("");
        setPasswordSuccess("");
    };


    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handleChangePassword = async (e) => {

        e.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = passwordData;


        // ----------------------------------------------
        // Validation
        // ----------------------------------------------

        if (!currentPassword) {

            setPasswordError(
                "Please enter your current password."
            );

            return;
        }

        if (!newPassword) {

            setPasswordError(
                "Please enter your new password."
            );

            return;
        }

        if (newPassword.length < 8) {

            setPasswordError(
                "New password must contain at least 8 characters."
            );

            return;
        }

        if (!confirmPassword) {

            setPasswordError(
                "Please confirm your new password."
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {

            setPasswordError(
                "New password and confirm password do not match."
            );

            return;
        }

        if (
            currentPassword ===
            newPassword
        ) {

            setPasswordError(
                "New password must be different from your current password."
            );

            return;
        }


        // ----------------------------------------------
        // API
        // ----------------------------------------------

        try {

            setPasswordLoading(true);

            const response =
                await changePasswordApi({
                    currentPassword,
                    newPassword,
                    confirmPassword
                });


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to change password."
                );
            }


            setPasswordSuccess(
                "Password changed successfully."
            );


            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });


            setTimeout(() => {

                setShowPasswordModal(
                    false
                );

                setPasswordSuccess("");

            }, 1500);


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            setPasswordError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to change password."
            );

        } finally {

            setPasswordLoading(false);
        }
    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    // ==================================================
    // SECTIONS
    // ==================================================

    const sections = [

        {
            id: "general",
            icon: "⚙️",
            label: "General",
            description: "Account and regional preferences"
        },

        {
            id: "notifications",
            icon: "🔔",
            label: "Notifications",
            description: "Manage mail notifications"
        },

        {
            id: "appearance",
            icon: "🎨",
            label: "Appearance",
            description: "Theme and display options"
        },

        {
            id: "security",
            icon: "🔐",
            label: "Security",
            description: "Password and account security"
        },

        {
            id: "privacy",
            icon: "🛡️",
            label: "Privacy",
            description: "Privacy and visibility"
        },

        {
            id: "session",
            icon: "💻",
            label: "Session",
            description: "Current login session"
        }
    ];


    // ==================================================
    // ACTIVE SECTION DATA
    // ==================================================

    const activeSectionData =
        sections.find(
            (section) =>
                section.id === activeSection
        );


    // ==================================================
    // SELECT SECTION
    // ==================================================

    const selectSection = (sectionId) => {

        setActiveSection(sectionId);

        setMobileMenuOpen(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div
            className="
                min-h-full
                bg-gray-50
                text-gray-900
                transition-colors
                duration-200
            "
        >

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <header
                className="
                    border-b
                    border-gray-200
                    bg-white
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-4
                        py-5
                        sm:px-6
                        lg:px-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        {/* -------------------------------------
                            TITLE
                        ------------------------------------- */}

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(-1)
                                    }
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        text-gray-600
                                        transition
                                        hover:bg-gray-100
                                    "
                                    title="Go back"
                                >
                                    ←
                                </button>

                                <div>

                                    <h1
                                        className="
                                            text-2xl
                                            font-bold
                                            text-gray-900
                                            sm:text-3xl
                                        "
                                    >
                                        Settings
                                    </h1>

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        Manage your DarkMail
                                        preferences and account.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* -------------------------------------
                            ACTIONS
                        ------------------------------------- */}

                        <div
                            className="
                                flex
                                w-full
                                gap-2
                                sm:w-auto
                            "
                        >

                            <button
                                type="button"
                                onClick={resetSettings}
                                className="
                                    flex-1
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                    sm:flex-none
                                "
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={saveSettings}
                                className="
                                    flex-1
                                    rounded-lg
                                    bg-blue-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                    sm:flex-none
                                "
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
                className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-5
                    sm:px-6
                    sm:py-6
                    lg:px-8
                "
            >

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {saveMessage && (

                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-3
                            text-sm
                            text-green-700
                        "
                    >

                        <span>
                            ✓
                        </span>

                        <span>
                            {saveMessage}
                        </span>

                    </div>

                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {saveError && (

                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >

                        <span>
                            ⚠
                        </span>

                        <span>
                            {saveError}
                        </span>

                    </div>

                )}


                {/* =================================================
                    MOBILE SECTION SELECTOR
                ================================================= */}

                <div
                    className="
                        mb-5
                        lg:hidden
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            p-4
                            text-left
                        "
                    >

                        <div
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >

                            <span
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-blue-50
                                    text-lg
                                "
                            >
                                {activeSectionData?.icon}
                            </span>

                            <div className="min-w-0">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    {activeSectionData?.label}
                                </p>

                                <p
                                    className="
                                        truncate
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    {activeSectionData?.description}
                                </p>

                            </div>

                        </div>

                        <span>
                            {mobileMenuOpen
                                ? "▲"
                                : "▼"}
                        </span>

                    </button>


                    {mobileMenuOpen && (

                        <div
                            className="
                                mt-2
                                overflow-hidden
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                            "
                        >

                            {sections.map(
                                (section) => (

                                    <button
                                        key={
                                            section.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            selectSection(
                                                section.id
                                            )
                                        }
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            border-b
                                            border-gray-100
                                            p-4
                                            text-left
                                            last:border-b-0
                                            ${
                                                activeSection ===
                                                section.id
                                                    ? "bg-blue-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        `}
                                    >

                                        <span>
                                            {
                                                section.icon
                                            }
                                        </span>

                                        <div>

                                            <p
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-gray-900
                                                "
                                            >
                                                {
                                                    section.label
                                                }
                                            </p>

                                            <p
                                                className="
                                                    mt-0.5
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                {
                                                    section.description
                                                }
                                            </p>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    DESKTOP LAYOUT
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-6
                        lg:grid-cols-[240px_minmax(0,1fr)]
                    "
                >

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside
                        className="
                            hidden
                            lg:block
                        "
                    >

                        <div
                            className="
                                sticky
                                top-6
                                overflow-hidden
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                p-2
                            "
                        >

                            {sections.map(
                                (section) => (

                                    <button
                                        key={
                                            section.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            selectSection(
                                                section.id
                                            )
                                        }
                                        className={`
                                            mb-1
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-lg
                                            px-3
                                            py-3
                                            text-left
                                            transition
                                            last:mb-0
                                            ${
                                                activeSection ===
                                                section.id
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }
                                        `}
                                    >

                                        <span
                                            className="
                                                text-lg
                                            "
                                        >
                                            {
                                                section.icon
                                            }
                                        </span>

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
                                                "
                                            >
                                                {
                                                    section.label
                                                }
                                            </p>

                                            <p
                                                className="
                                                    mt-0.5
                                                    truncate
                                                    text-[11px]
                                                    text-gray-400
                                                "
                                            >
                                                {
                                                    section.description
                                                }
                                            </p>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    </aside>


                    {/* =================================================
                        SETTINGS CONTENT
                    ================================================= */}

                    <main
                        className="
                            min-w-0
                            space-y-6
                        "
                    >

                        {/* =================================================
                            GENERAL
                        ================================================= */}

                        {activeSection ===
                            "general" && (

                            <section
                                className="
                                    space-y-6
                                "
                            >

                                {/* Account */}

                                <SettingsCard
                                    title="Account Information"
                                    description="Your DarkMail account information."
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-5
                                            sm:flex-row
                                            sm:items-center
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-20
                                                w-20
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-blue-600
                                                text-2xl
                                                font-bold
                                                text-white
                                            "
                                        >

                                            {(
                                                user?.name ||
                                                "D"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <h3
                                                className="
                                                    text-lg
                                                    font-semibold
                                                    text-gray-900
                                                "
                                            >
                                                {user?.name ||
                                                    "DarkMail User"}
                                            </h3>

                                            <p
                                                className="
                                                    mt-1
                                                    break-all
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                {user?.email ||
                                                    "No email available"}
                                            </p>


                                            <div
                                                className="
                                                    mt-3
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                "
                                            >

                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-blue-50
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-blue-700
                                                    "
                                                >
                                                    {user?.role ||
                                                        "USER"}
                                                </span>

                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-green-50
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-green-700
                                                    "
                                                >
                                                    Active
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </SettingsCard>


                                {/* Regional Preferences */}

                                <SettingsCard
                                    title="Regional Preferences"
                                    description="Configure your language and timezone."
                                >

                                    <div
                                        className="
                                            grid
                                            gap-5
                                            sm:grid-cols-2
                                        "
                                    >

                                        <SelectField
                                            label="Language"
                                            value={
                                                settings.language
                                            }
                                            onChange={(e) =>
                                                updateSetting(
                                                    "language",
                                                    e.target.value
                                                )
                                            }
                                            options={[
                                                "English",
                                                "Hindi"
                                            ]}
                                        />

                                        <SelectField
                                            label="Timezone"
                                            value={
                                                settings.timezone
                                            }
                                            onChange={(e) =>
                                                updateSetting(
                                                    "timezone",
                                                    e.target.value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "Asia/Kolkata",
                                                    label: "India Standard Time"
                                                },
                                                {
                                                    value: "UTC",
                                                    label: "UTC"
                                                }
                                            ]}
                                        />

                                    </div>

                                </SettingsCard>

                            </section>
                        )}


                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        {activeSection ===
                            "notifications" && (

                            <SettingsCard
                                title="Notification Settings"
                                description="Control how DarkMail notifies you."
                            >

                                <div
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    <SettingToggle
                                        title="Email Notifications"
                                        description="Receive notifications about important account activity."
                                        checked={
                                            settings.emailNotifications
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "emailNotifications",
                                                value
                                            )
                                        }
                                    />

                                    <SettingToggle
                                        title="New Mail Notifications"
                                        description="Get notified when a new message arrives."
                                        checked={
                                            settings.newMailNotifications
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "newMailNotifications",
                                                value
                                            )
                                        }
                                    />

                                    <SettingToggle
                                        title="Message Read Notifications"
                                        description="Notify when a message you sent is read."
                                        checked={
                                            settings.messageReadNotifications
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "messageReadNotifications",
                                                value
                                            )
                                        }
                                    />

                                    <SettingToggle
                                        title="Desktop Notifications"
                                        description="Show browser notifications for new mail."
                                        checked={
                                            settings.desktopNotifications
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "desktopNotifications",
                                                value
                                            )
                                        }
                                    />

                                    <SettingToggle
                                        title="Notification Sound"
                                        description="Play a sound when new mail arrives."
                                        checked={
                                            settings.soundNotifications
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "soundNotifications",
                                                value
                                            )
                                        }
                                    />

                                </div>

                            </SettingsCard>
                        )}


                        {/* =================================================
                            APPEARANCE
                        ================================================= */}

                        {activeSection ===
                            "appearance" && (

                            <section
                                className="
                                    space-y-6
                                "
                            >

                                {/* Theme */}

                                <SettingsCard
                                    title="Theme"
                                    description="Choose the global DarkMail appearance."
                                >

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                        "
                                    >

                                        {/* ---------------------------------
                                            LIGHT MODE
                                        --------------------------------- */}

                                        <ThemeCard
                                            theme="light"
                                            currentTheme={
                                                theme
                                            }
                                            title="☀️ Light Mode"
                                            description="Clean and bright interface"
                                            onClick={() =>
                                                setTheme(
                                                    "light"
                                                )
                                            }
                                        />


                                        {/* ---------------------------------
                                            DARK MODE
                                        --------------------------------- */}

                                        <ThemeCard
                                            theme="dark"
                                            currentTheme={
                                                theme
                                            }
                                            title="🌙 Dark Mode"
                                            description="Comfortable for low-light environments"
                                            onClick={() =>
                                                setTheme(
                                                    "dark"
                                                )
                                            }
                                        />

                                    </div>


                                    {/* Current theme */}

                                    <div
                                        className="
                                            mt-5
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-xl
                                            border
                                            border-blue-100
                                            bg-blue-50
                                            p-4
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        <div>

                                            <p
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-blue-900
                                                "
                                            >
                                                Current Theme
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-blue-700
                                                "
                                            >
                                                DarkMail is currently using{" "}
                                                <strong>
                                                    {isDark
                                                        ? "Dark Mode"
                                                        : "Light Mode"}
                                                </strong>
                                                .
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                toggleTheme
                                            }
                                            className="
                                                rounded-lg
                                                bg-blue-600
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-white
                                                transition
                                                hover:bg-blue-700
                                            "
                                        >
                                            Switch to{" "}
                                            {isDark
                                                ? "Light"
                                                : "Dark"}{" "}
                                            Mode
                                        </button>

                                    </div>

                                </SettingsCard>


                                {/* Display */}

                                <SettingsCard
                                    title="Display"
                                    description="Customize how messages are displayed."
                                >

                                    <div
                                        className="
                                            divide-y
                                            divide-gray-100
                                        "
                                    >

                                        <SettingToggle
                                            title="Compact Mode"
                                            description="Display more messages by reducing spacing."
                                            checked={
                                                settings.compactMode
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "compactMode",
                                                    value
                                                )
                                            }
                                        />

                                        <SettingToggle
                                            title="Show Avatars"
                                            description="Show sender profile initials or pictures."
                                            checked={
                                                settings.showAvatars
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "showAvatars",
                                                    value
                                                )
                                            }
                                        />

                                        <SettingToggle
                                            title="Automatically Mark as Read"
                                            description="Mark messages as read when opened."
                                            checked={
                                                settings.autoMarkRead
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "autoMarkRead",
                                                    value
                                                )
                                            }
                                        />

                                        <SettingToggle
                                            title="Automatically Save Drafts"
                                            description="Save unfinished messages automatically."
                                            checked={
                                                settings.autoSaveDrafts
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "autoSaveDrafts",
                                                    value
                                                )
                                            }
                                        />

                                    </div>

                                </SettingsCard>

                            </section>
                        )}


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        {activeSection ===
                            "security" && (

                            <section
                                className="
                                    space-y-6
                                "
                            >

                                <SettingsCard
                                    title="Security"
                                    description="Protect your DarkMail account."
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        <div>

                                            <h3
                                                className="
                                                    font-medium
                                                    text-gray-900
                                                "
                                            >
                                                Password
                                            </h3>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                Change your DarkMail
                                                account password.
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                openPasswordModal
                                            }
                                            className="
                                                rounded-lg
                                                bg-blue-600
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-white
                                                transition
                                                hover:bg-blue-700
                                            "
                                        >
                                            Change Password
                                        </button>

                                    </div>

                                </SettingsCard>


                                {/* Security recommendation */}

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-yellow-200
                                        bg-yellow-50
                                        p-5
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            gap-3
                                        "
                                    >

                                        <span
                                            className="
                                                text-xl
                                            "
                                        >
                                            ⚠️
                                        </span>

                                        <div>

                                            <h3
                                                className="
                                                    font-semibold
                                                    text-yellow-900
                                                "
                                            >
                                                Security Recommendation
                                            </h3>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    leading-6
                                                    text-yellow-800
                                                "
                                            >
                                                Use a strong password
                                                containing uppercase,
                                                lowercase, numbers and
                                                special characters.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            PRIVACY
                        ================================================= */}

                        {activeSection ===
                            "privacy" && (

                            <SettingsCard
                                title="Privacy"
                                description="Manage your DarkMail privacy preferences."
                            >

                                <div
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    <SettingToggle
                                        title="Show Online Status"
                                        description="Allow other employees to see when you are active."
                                        checked={
                                            settings.showOnlineStatus
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "showOnlineStatus",
                                                value
                                            )
                                        }
                                    />

                                    <SettingToggle
                                        title="Show Read Status"
                                        description="Allow senders to know when you have read their messages."
                                        checked={
                                            settings.showReadStatus
                                        }
                                        onChange={(value) =>
                                            updateSetting(
                                                "showReadStatus",
                                                value
                                            )
                                        }
                                    />


                                    <div
                                        className="
                                            p-5
                                        "
                                    >

                                        <h3
                                            className="
                                                font-medium
                                                text-gray-900
                                            "
                                        >
                                            Account Privacy
                                        </h3>

                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                leading-6
                                                text-gray-500
                                            "
                                        >
                                            Your DarkMail account
                                            information is associated
                                            with your employee profile.
                                        </p>

                                    </div>

                                </div>

                            </SettingsCard>
                        )}


                        {/* =================================================
                            SESSION
                        ================================================= */}

                        {activeSection ===
                            "session" && (

                            <section
                                className="
                                    space-y-6
                                "
                            >

                                <SettingsCard
                                    title="Current Session"
                                    description="Information about your current DarkMail session."
                                >

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                        "
                                    >

                                        <InfoBox
                                            label="Account"
                                            value={
                                                user?.email ||
                                                "Unknown"
                                            }
                                        />

                                        <InfoBox
                                            label="Role"
                                            value={
                                                user?.role ||
                                                "USER"
                                            }
                                        />

                                        <InfoBox
                                            label="Employee ID"
                                            value={
                                                user?.employeeId ||
                                                "Not available"
                                            }
                                        />

                                        <InfoBox
                                            label="Session Status"
                                            value="Active"
                                        />

                                        <InfoBox
                                            label="Theme"
                                            value={
                                                isLight
                                                    ? "Light Mode"
                                                    : "Dark Mode"
                                            }
                                        />

                                        <InfoBox
                                            label="Timezone"
                                            value={
                                                settings.timezone
                                            }
                                        />

                                    </div>

                                </SettingsCard>


                                {/* Logout */}

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-white
                                    "
                                >

                                    <div
                                        className="
                                            p-5
                                        "
                                    >

                                        <h2
                                            className="
                                                font-semibold
                                                text-gray-900
                                            "
                                        >
                                            Sign Out
                                        </h2>

                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                text-gray-500
                                            "
                                        >
                                            Sign out from your current
                                            DarkMail session.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowLogoutModal(
                                                    true
                                                )
                                            }
                                            className="
                                                mt-4
                                                rounded-lg
                                                bg-red-600
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-white
                                                transition
                                                hover:bg-red-700
                                            "
                                        >
                                            Sign Out
                                        </button>

                                    </div>

                                </div>

                            </section>
                        )}

                    </main>

                </div>

            </div>


            {/* ==========================================================
                CHANGE PASSWORD MODAL
            ========================================================== */}

            {showPasswordModal && (

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
                            max-w-md
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* Modal Header */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-100
                                px-5
                                py-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    Change Password
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    Update your DarkMail
                                    account password.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closePasswordModal
                                }
                                disabled={
                                    passwordLoading
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-lg
                                    text-gray-500
                                    hover:bg-gray-100
                                    disabled:opacity-50
                                "
                            >
                                ×
                            </button>

                        </div>


                        {/* Modal Form */}

                        <form
                            onSubmit={
                                handleChangePassword
                            }
                            className="
                                space-y-4
                                p-5
                            "
                        >

                            {/* Error */}

                            {passwordError && (

                                <div
                                    className="
                                        rounded-lg
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-700
                                    "
                                >
                                    {passwordError}
                                </div>

                            )}


                            {/* Success */}

                            {passwordSuccess && (

                                <div
                                    className="
                                        rounded-lg
                                        border
                                        border-green-200
                                        bg-green-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-green-700
                                    "
                                >
                                    {passwordSuccess}
                                </div>

                            )}


                            <PasswordInput
                                label="Current Password"
                                name="currentPassword"
                                value={
                                    passwordData.currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                disabled={
                                    passwordLoading
                                }
                                autoComplete="current-password"
                            />

                            <PasswordInput
                                label="New Password"
                                name="newPassword"
                                value={
                                    passwordData.newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                disabled={
                                    passwordLoading
                                }
                                autoComplete="new-password"
                            />

                            <PasswordInput
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={
                                    passwordData.confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                disabled={
                                    passwordLoading
                                }
                                autoComplete="new-password"
                            />


                            <div
                                className="
                                    rounded-lg
                                    bg-gray-50
                                    p-3
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Password must contain at least
                                8 characters.
                            </div>


                            {/* Buttons */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-2
                                    pt-2
                                    sm:flex-row
                                    sm:justify-end
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closePasswordModal
                                    }
                                    disabled={
                                        passwordLoading
                                    }
                                    className="
                                        rounded-lg
                                        border
                                        border-gray-300
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        transition
                                        hover:bg-gray-50
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        passwordLoading
                                    }
                                    className="
                                        rounded-lg
                                        bg-blue-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-blue-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >

                                    {passwordLoading
                                        ? "Changing..."
                                        : "Change Password"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==========================================================
                LOGOUT MODAL
            ========================================================== */}

            {showLogoutModal && (

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
                            p-6
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-100
                                text-xl
                            "
                        >
                            🚪
                        </div>


                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Sign out?
                        </h2>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            Are you sure you want to sign out
                            of DarkMail?
                        </p>


                        <div
                            className="
                                mt-6
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
                                    setShowLogoutModal(
                                        false
                                    )
                                }
                                className="
                                    rounded-lg
                                    border
                                    border-gray-300
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className="
                                    rounded-lg
                                    bg-red-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-700
                                "
                            >
                                Sign Out
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


// ======================================================
// SETTINGS CARD
// ======================================================

const SettingsCard = ({
    title,
    description,
    children
}) => {

    return (

        <section
            className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
            "
        >

            <div
                className="
                    border-b
                    border-gray-100
                    px-5
                    py-4
                    sm:px-6
                "
            >

                <h2
                    className="
                        font-semibold
                        text-gray-900
                    "
                >
                    {title}
                </h2>

                {description && (

                    <p
                        className="
                            mt-1
                            text-sm
                            leading-5
                            text-gray-500
                        "
                    >
                        {description}
                    </p>

                )}

            </div>

            <div
                className="
                    p-5
                    sm:p-6
                "
            >
                {children}
            </div>

        </section>
    );
};


// ======================================================
// SETTING TOGGLE
// ======================================================

const SettingToggle = ({
    title,
    description,
    checked,
    onChange
}) => {

    return (

        <div
            className="
                flex
                items-start
                justify-between
                gap-4
                p-5
            "
        >

            <div
                className="
                    min-w-0
                "
            >

                <h3
                    className="
                        font-medium
                        text-gray-900
                    "
                >
                    {title}
                </h3>

                <p
                    className="
                        mt-1
                        text-sm
                        leading-5
                        text-gray-500
                    "
                >
                    {description}
                </p>

            </div>


            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() =>
                    onChange(!checked)
                }
                className={`
                    relative
                    mt-1
                    h-6
                    w-11
                    shrink-0
                    rounded-full
                    transition
                    ${
                        checked
                            ? "bg-blue-600"
                            : "bg-gray-300"
                    }
                `}
            >

                <span
                    className={`
                        absolute
                        top-1
                        h-4
                        w-4
                        rounded-full
                        bg-white
                        shadow
                        transition
                        ${
                            checked
                                ? "left-6"
                                : "left-1"
                        }
                    `}
                />

            </button>

        </div>
    );
};


// ======================================================
// THEME CARD
// ======================================================

const ThemeCard = ({
    theme,
    currentTheme,
    title,
    description,
    onClick
}) => {

    const selected =
        theme === currentTheme;

    const isDarkTheme =
        theme === "dark";

    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                rounded-xl
                border-2
                p-3
                text-left
                transition
                sm:p-4
                ${
                    selected
                        ? isDarkTheme
                            ? "border-blue-500 bg-slate-800"
                            : "border-blue-600 bg-blue-50"
                        : isDarkTheme
                            ? "border-slate-700 bg-slate-900 hover:border-slate-600"
                            : "border-gray-200 bg-white hover:border-gray-300"
                }
            `}
        >

            {/* ---------------------------------------------
                PREVIEW
            --------------------------------------------- */}

            <div
                className={`
                    mb-4
                    overflow-hidden
                    rounded-lg
                    border
                    ${
                        isDarkTheme
                            ? "border-slate-700 bg-slate-950"
                            : "border-gray-200 bg-white"
                    }
                `}
            >

                {/* Browser header */}

                <div
                    className={`
                        flex
                        h-7
                        items-center
                        gap-1
                        border-b
                        px-3
                        ${
                            isDarkTheme
                                ? "border-slate-700"
                                : "border-gray-200"
                        }
                    `}
                >

                    <span className="h-2 w-2 rounded-full bg-red-400" />

                    <span className="h-2 w-2 rounded-full bg-yellow-400" />

                    <span className="h-2 w-2 rounded-full bg-green-400" />

                </div>


                {/* Preview */}

                <div
                    className="
                        flex
                        h-24
                    "
                >

                    {/* Sidebar */}

                    <div
                        className={`
                            w-1/4
                            border-r
                            p-2
                            ${
                                isDarkTheme
                                    ? "border-slate-700 bg-slate-950"
                                    : "border-gray-200 bg-gray-50"
                            }
                        `}
                    >

                        <div
                            className={`
                                mb-2
                                h-2
                                w-full
                                rounded
                                ${
                                    isDarkTheme
                                        ? "bg-blue-800"
                                        : "bg-blue-200"
                                }
                            `}
                        />

                        <div
                            className={`
                                mb-2
                                h-2
                                w-3/4
                                rounded
                                ${
                                    isDarkTheme
                                        ? "bg-slate-700"
                                        : "bg-gray-200"
                                }
                            `}
                        />

                        <div
                            className={`
                                h-2
                                w-2/3
                                rounded
                                ${
                                    isDarkTheme
                                        ? "bg-slate-700"
                                        : "bg-gray-200"
                                }
                            `}
                        />

                    </div>


                    {/* Content */}

                    <div
                        className="
                            flex-1
                            p-3
                        "
                    >

                        <div
                            className={`
                                mb-3
                                h-3
                                w-1/2
                                rounded
                                ${
                                    isDarkTheme
                                        ? "bg-slate-700"
                                        : "bg-gray-200"
                                }
                            `}
                        />

                        <div
                            className="
                                space-y-2
                            "
                        >

                            <div
                                className={`
                                    h-2
                                    w-full
                                    rounded
                                    ${
                                        isDarkTheme
                                            ? "bg-slate-800"
                                            : "bg-gray-100"
                                    }
                                `}
                            />

                            <div
                                className={`
                                    h-2
                                    w-4/5
                                    rounded
                                    ${
                                        isDarkTheme
                                            ? "bg-slate-800"
                                            : "bg-gray-100"
                                    }
                                `}
                            />

                            <div
                                className={`
                                    h-2
                                    w-3/5
                                    rounded
                                    ${
                                        isDarkTheme
                                            ? "bg-slate-800"
                                            : "bg-gray-100"
                                    }
                                `}
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ---------------------------------------------
                TITLE
            --------------------------------------------- */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >

                <div
                    className="
                        min-w-0
                    "
                >

                    <h3
                        className={`
                            font-semibold
                            ${
                                isDarkTheme
                                    ? "text-white"
                                    : "text-gray-900"
                            }
                        `}
                    >
                        {title}
                    </h3>

                    <p
                        className={`
                            mt-1
                            text-xs
                            ${
                                isDarkTheme
                                    ? "text-slate-400"
                                    : "text-gray-500"
                            }
                        `}
                    >
                        {description}
                    </p>

                </div>


                {/* Radio */}

                <div
                    className={`
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        ${
                            selected
                                ? "border-blue-600"
                                : isDarkTheme
                                    ? "border-slate-500"
                                    : "border-gray-300"
                        }
                    `}
                >

                    {selected && (

                        <span
                            className="
                                h-2.5
                                w-2.5
                                rounded-full
                                bg-blue-600
                            "
                        />

                    )}

                </div>

            </div>

        </button>
    );
};


// ======================================================
// SELECT FIELD
// ======================================================

const SelectField = ({
    label,
    value,
    onChange,
    options
}) => {

    return (

        <div>

            <label
                className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                "
            >
                {label}
            </label>

            <select
                value={value}
                onChange={onChange}
                className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                "
            >

                {options.map(
                    (option) => {

                        const item =
                            typeof option ===
                            "string"
                                ? {
                                      value: option,
                                      label: option
                                  }
                                : option;

                        return (
                            <option
                                key={
                                    item.value
                                }
                                value={
                                    item.value
                                }
                            >
                                {
                                    item.label
                                }
                            </option>
                        );
                    }
                )}

            </select>

        </div>
    );
};


// ======================================================
// PASSWORD INPUT
// ======================================================

const PasswordInput = ({
    label,
    name,
    value,
    onChange,
    disabled,
    autoComplete
}) => {

    return (

        <div>

            <label
                htmlFor={name}
                className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                "
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type="password"
                value={value}
                onChange={onChange}
                disabled={disabled}
                autoComplete={
                    autoComplete
                }
                className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                "
            />

        </div>
    );
};


// ======================================================
// INFO BOX
// ======================================================

const InfoBox = ({
    label,
    value
}) => {

    return (

        <div
            className="
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                p-4
            "
        >

            <p
                className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-gray-400
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-1
                    break-all
                    text-sm
                    font-semibold
                    text-gray-900
                "
            >
                {value}
            </p>

        </div>
    );
};


export default Settings;