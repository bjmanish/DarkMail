import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ShieldCheck,
    AlertCircle,
    Loader2,
    ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


/* ================================================================
   LOGIN
================================================================ */

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();


    /* ============================================================
       FORM STATE
    ============================================================ */

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);


    /* ============================================================
       HANDLE INPUT
    ============================================================ */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));


        /*
         * Clear old messages when user starts typing.
         */

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };


    /* ============================================================
       GET SESSION ID
    ============================================================ */

    const getStoredSessionId = () => {

        try {

            return (
                localStorage.getItem(
                    "darkmail_session_id"
                ) ||
                localStorage.getItem(
                    "sessionId"
                ) ||
                ""
            ).trim();

        } catch (error) {

            console.warn(
                "Unable to read session ID:",
                error
            );

            return "";
        }
    };


    /* ============================================================
       CREATE FALLBACK SESSION ID
       
       IMPORTANT:
       This is only a frontend fallback identifier.
       It is NOT an authentication token.
    ============================================================ */

    const createFallbackSessionId = () => {

        try {

            if (
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
            ) {

                return crypto.randomUUID();
            }

        } catch (error) {

            console.warn(
                "crypto.randomUUID unavailable:",
                error
            );
        }


        return (
            "dm_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 12)
        );
    };


    /* ============================================================
       SAVE SESSION
    ============================================================ */

    const saveSession = (sessionId) => {

        if (!sessionId) {
            return;
        }


        try {

            localStorage.setItem(
                "darkmail_session_id",
                String(sessionId)
            );


            /*
             * Backward compatibility
             */

            localStorage.setItem(
                "sessionId",
                String(sessionId)
            );

        } catch (error) {

            console.error(
                "Unable to save session ID:",
                error
            );
        }
    };


    /* ============================================================
       SAVE AUTH TOKEN
    ============================================================ */

    const saveToken = (token) => {

        if (!token) {
            return;
        }


        try {

            localStorage.setItem(
                "darkmail_auth",
                String(token)
            );


            /*
             * Backward compatibility
             */

            localStorage.setItem(
                "token",
                String(token)
            );

        } catch (error) {

            console.error(
                "Unable to save authentication token:",
                error
            );
        }
    };


    /* ============================================================
       SAVE USER
    ============================================================ */

    const saveUser = (user) => {

        if (
            !user ||
            typeof user !== "object"
        ) {
            return;
        }


        try {

            localStorage.setItem(
                "darkmail_user",
                JSON.stringify(user)
            );

        } catch (error) {

            console.error(
                "Unable to save user:",
                error
            );
        }
    };


    /* ============================================================
       GET USER FROM RESPONSE
    ============================================================ */

    const extractUser = (response) => {

        return (
            response?.user ||
            response?.data?.user ||
            response?.employee ||
            response?.data?.employee ||
            response?.data ||
            response
        );
    };


    /* ============================================================
       GET ROLE FROM RESPONSE
    ============================================================ */

    const extractRole = (
        response,
        user
    ) => {

        return String(
            user?.role ||
            user?.roleName ||
            user?.role_name ||
            user?.userRole ||

            response?.role ||
            response?.roleName ||

            response?.data?.role ||
            response?.data?.roleName ||
            response?.data?.role_name ||

            ""
        )
            .trim()
            .toUpperCase();
    };


    /* ============================================================
       GET SESSION ID FROM RESPONSE
    ============================================================ */

    const extractSessionId = (
        response,
        user
    ) => {

        return (
            response?.sessionId ||
            response?.session_id ||

            response?.data?.sessionId ||
            response?.data?.session_id ||

            user?.sessionId ||

            getStoredSessionId()
        );
    };


    /* ============================================================
       GET TOKEN FROM RESPONSE
    ============================================================ */

    const extractToken = (response) => {

        return (
            response?.token ||
            response?.accessToken ||

            response?.data?.token ||
            response?.data?.accessToken ||

            ""
        );
    };


    /* ============================================================
       HANDLE LOGIN
    ============================================================ */

    const handleSubmit = async (event) => {

        event.preventDefault();


        /*
         * Prevent duplicate requests.
         */

        if (loading) {
            return;
        }


        setError("");
        setSuccess("");


        const cleanEmail =
            formData.email
                .trim()
                .toLowerCase();


        const password =
            formData.password;


        /* ========================================================
           VALIDATION
        ======================================================== */

        if (!cleanEmail) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        /*
         * Basic email validation.
         */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(cleanEmail)) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }

        setLoading(true);

        try {

            /* ====================================================
               LOGIN THROUGH AUTH CONTEXT
            ==================================================== */

            const response = await login({
                email: cleanEmail,
                password: password,
            });

            /* ====================================================
               EXTRACT USER
            ==================================================== */

            const user =
                extractUser(response);

            /* ====================================================
               EXTRACT ROLE
            ==================================================== */

            const role =
                extractRole(
                    response,
                    user
                );

            /* ====================================================
               VALIDATE ROLE
            ==================================================== */

            if (!role) {

                throw new Error(
                    "Your account role could not be determined."
                );
            }


            /* ====================================================
               SESSION ID
            ==================================================== */

            let sessionId =
                extractSessionId(
                    response,
                    user
                );


            /*
             * If backend does not provide sessionId,
             * create a client-side identifier.
             *
             * NOTE:
             * This is NOT authentication.
             */

            if (!sessionId) {

                sessionId =
                    createFallbackSessionId();


                console.warn(
                    "Backend did not provide sessionId. " +
                    "Generated client-side session ID."
                );
            }


            saveSession(sessionId);


            /* ====================================================
               TOKEN
            ==================================================== */

            const token =
                extractToken(response);


            if (token) {

                saveToken(token);

            } else {

                console.warn(
                    "No authentication token was returned."
                );
            }


            /* ====================================================
               USER
            ==================================================== */

            saveUser(user);


            /* ====================================================
               SUCCESS MESSAGE
            ==================================================== */

            setSuccess(
                "Login successful. Redirecting..."
            );


            /* ====================================================
               ADMIN
            ==================================================== */

            if (
                role === "ADMIN" ||
                role === "ADMINISTRATOR"
            ) {
                
                navigate(
                    "/admin/dashboard",
                    {
                        replace: true,
                    }
                );


                return;
            }


            /* ====================================================
               USER / EMPLOYEE
            ==================================================== */

            if (
                role === "USER" ||
                role === "EMPLOYEE"
            ) {

                const inboxUrl =
                    `/user/mail?Folder=inbox&sessionId=${encodeURIComponent(
                        sessionId
                    )}`;


                console.log(
                    "Redirecting USER to:",
                    inboxUrl
                );


                navigate(
                    inboxUrl,
                    {
                        replace: true,
                    }
                );


                return;
            }


            /* ====================================================
               UNKNOWN ROLE
            ==================================================== */

            console.error(
                "Unknown user role:",
                role
            );


            throw new Error(
                `Access denied. Unsupported account role: ${role}`
            );


        } catch (error) {

            console.error(
                "DarkMail Login Error:",
                error
            );


            /*
             * Axios backend error
             */

            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.response?.data?.details;


            const errorMessage =
                backendMessage ||
                error?.message ||
                "Login failed. Please check your email and password.";


            setError(
                errorMessage
            );

        } finally {

            setLoading(false);
        }
    };


    /* ============================================================
       UI
    ============================================================ */

    return (

        <main
            className="
                relative
                min-h-screen
                w-full
                overflow-hidden
                bg-slate-700
            "
        >

            {/* ====================================================
                BACKGROUND
            ==================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute
                        -left-32
                        -top-32
                        h-72
                        w-72
                        rounded-full
                        bg-blue-600/20
                        blur-3xl
                        sm:h-96
                        sm:w-96
                    "
                />


                <div
                    className="
                        absolute
                        -bottom-32
                        -right-32
                        h-80
                        w-80
                        rounded-full
                        bg-indigo-600/20
                        blur-3xl
                        sm:h-[28rem]
                        sm:w-[28rem]
                    "
                />


                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-64
                        w-64
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-cyan-500/10
                        blur-3xl
                        sm:h-96
                        sm:w-96
                    "
                />

            </div>


            {/* ====================================================
                CONTENT
            ==================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    min-h-screen
                    w-full
                    items-center
                    justify-center
                    px-4
                    py-6
                    sm:px-6
                    sm:py-10
                    lg:px-8
                "
            >

                <div
                    className="
                        grid
                        w-full
                        max-w-5xl
                        overflow-hidden
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/5
                        shadow-2xl
                        backdrop-blur-xl
                        lg:grid-cols-2
                    "
                >

                    {/* =================================================
                        LEFT BRAND PANEL
                    ================================================== */}

                    <section
                        className="
                            hidden
                            bg-gradient-to-br
                            from-blue-700
                            via-indigo-700
                            to-violet-800
                            p-8
                            text-white
                            lg:flex
                            lg:min-h-[620px]
                            lg:flex-col
                            lg:justify-between
                            lg:p-10
                            xl:p-12
                        "
                    >

                        <div>

                            {/* Logo */}

                            <div
                                className="
                                    mb-8
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-white/15
                                    ring-1
                                    ring-white/20
                                "
                            >

                                <Mail
                                    size={28}
                                    strokeWidth={2}
                                />

                            </div>


                            <h1
                                className="
                                    text-4xl
                                    font-bold
                                    tracking-tight
                                    xl:text-5xl
                                "
                            >
                                DarkMail
                            </h1>


                            <p
                                className="
                                    mt-4
                                    max-w-md
                                    text-base
                                    leading-7
                                    text-blue-100
                                    xl:text-lg
                                "
                            >
                                A secure internal communication
                                platform for your organization.
                            </p>


                            {/* Features */}

                            <div
                                className="
                                    mt-10
                                    space-y-5
                                "
                            >

                                <Feature
                                    title="Secure communication"
                                    description="Keep internal conversations organized and protected."
                                />


                                <Feature
                                    title="Simple mail management"
                                    description="Inbox, sent messages, drafts and trash in one place."
                                />


                                <Feature
                                    title="Role-based access"
                                    description="Admins and employees get the tools they need."
                                />

                            </div>

                        </div>


                        {/* Bottom */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-blue-100/70
                            "
                        >

                            <ShieldCheck size={15} />

                            Authorized users only

                        </div>

                    </section>


                    {/* =================================================
                        RIGHT LOGIN PANEL
                    ================================================== */}

                    <section
                        className="
                            flex
                            min-w-0
                            flex-col
                            justify-center
                            bg-white
                            px-5
                            py-7
                            sm:px-8
                            sm:py-9
                            lg:px-10
                            xl:px-12
                        "
                    >

                        {/* =================================================
                            MOBILE BRAND
                        ================================================== */}

                        <div
                            className="
                                mb-7
                                text-center
                                lg:hidden
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-indigo-600
                                    text-white
                                    shadow-lg
                                "
                            >

                                <Mail size={27} />

                            </div>


                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                "
                            >
                                DarkMail
                            </h1>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Secure Internal Mail System
                            </p>

                        </div>


                        {/* =================================================
                            LOGIN HEADER
                        ================================================== */}

                        <div
                            className="
                                mb-6
                            "
                        >

                            <div
                                className="
                                    mb-2
                                    inline-flex
                                    items-center
                                    rounded-full
                                    bg-blue-50
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-blue-600
                                "
                            >
                                Welcome back
                            </div>


                            <h2
                                className="
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-gray-900
                                    sm:text-3xl
                                "
                            >
                                Sign in to DarkMail
                            </h2>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    leading-5
                                    text-gray-500
                                "
                            >
                                Enter your credentials to access
                                your account.
                            </p>

                        </div>


                        {/* =================================================
                            ERROR
                        ================================================== */}

                        {error && (

                            <div
                                role="alert"
                                className="
                                    mb-5
                                    flex
                                    items-start
                                    gap-3
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-3.5
                                    py-3
                                    text-sm
                                    text-red-700
                                "
                            >

                                <AlertCircle
                                    size={18}
                                    className="
                                        mt-0.5
                                        shrink-0
                                    "
                                />


                                <p
                                    className="
                                        min-w-0
                                        flex-1
                                        break-words
                                    "
                                >
                                    {error}
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setError("")
                                    }
                                    className="
                                        shrink-0
                                        text-lg
                                        leading-none
                                        text-red-400
                                        hover:text-red-600
                                    "
                                    aria-label="Close error"
                                >
                                    ×
                                </button>

                            </div>
                        )}


                        {/* =================================================
                            SUCCESS
                        ================================================== */}

                        {success && (

                            <div
                                role="status"
                                className="
                                    mb-5
                                    rounded-xl
                                    border
                                    border-green-200
                                    bg-green-50
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    text-green-700
                                "
                            >
                                {success}
                            </div>

                        )}


                        {/* =================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={handleSubmit}
                            className="
                                space-y-5
                            "
                        >

                            {/* =================================================
                                EMAIL
                            ================================================== */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    Email address
                                </label>


                                <div
                                    className="
                                        relative
                                    "
                                >

                                    <Mail
                                        size={18}
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />


                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="you@darkmail.com"
                                        autoComplete="email"
                                        autoFocus
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            py-3.5
                                            pl-11
                                            pr-4
                                            text-sm
                                            text-gray-900
                                            outline-none
                                            transition
                                            placeholder:text-gray-400
                                            hover:border-gray-400
                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/10
                                            disabled:cursor-not-allowed
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PASSWORD
                            ================================================== */}

                            <div>

                                <label
                                    htmlFor="password"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    Password
                                </label>


                                <div
                                    className="
                                        relative
                                    "
                                >

                                    <Lock
                                        size={18}
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />


                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            py-3.5
                                            pl-11
                                            pr-12
                                            text-sm
                                            text-gray-900
                                            outline-none
                                            transition
                                            placeholder:text-gray-400
                                            hover:border-gray-400
                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/10
                                            disabled:cursor-not-allowed
                                            disabled:bg-gray-100
                                        "
                                    />


                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        className="
                                            absolute
                                            right-2
                                            top-1/2
                                            flex
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-lg
                                            p-2
                                            text-gray-400
                                            transition
                                            hover:bg-gray-100
                                            hover:text-gray-700
                                        "
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                SECURITY INFO
                            ================================================== */}

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2.5
                                    rounded-xl
                                    bg-gray-50
                                    px-3.5
                                    py-3
                                "
                            >

                                <ShieldCheck
                                    size={17}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-blue-600
                                    "
                                />


                                <p
                                    className="
                                        text-xs
                                        leading-5
                                        text-gray-500
                                    "
                                >
                                    Your account is protected
                                    with secure authentication.
                                </p>

                            </div>


                            {/* =================================================
                                LOGIN BUTTON
                            ================================================== */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-indigo-600
                                    px-4
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/20
                                    transition
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:from-blue-700
                                    hover:to-indigo-700
                                    hover:shadow-xl
                                    active:translate-y-0
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    disabled:hover:translate-y-0
                                "
                            >

                                {loading ? (

                                    <>
                                        <Loader2
                                            size={19}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Signing in...
                                    </>

                                ) : (

                                    <>
                                        <LogIn size={18} />

                                        Sign In

                                        <ArrowRight
                                            size={17}
                                            className="
                                                transition
                                                group-hover:translate-x-0.5
                                            "
                                        />
                                    </>

                                )}

                            </button>

                        </form>


                        {/* =================================================
                            FOOTER
                        ================================================== */}

                        <div
                            className="
                                mt-7
                                border-t
                                border-gray-100
                                pt-5
                                text-center
                            "
                        >

                            <p
                                className="
                                    text-[11px]
                                    leading-5
                                    text-gray-400
                                    sm:text-xs
                                "
                            >
                                DarkMail Internal Communication
                                System v{import.meta.env.VITE_PACKAGE_VERSION }  {import.meta.env.VITE_PACKAGE_YEAR }
                            </p>


                            <div
                                className="
                                    mt-2
                                    flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    text-[10px]
                                    text-gray-400
                                "
                            >

                                <ShieldCheck size={13} />

                                Authorized users only

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
};


/* ================================================================
   FEATURE COMPONENT
================================================================ */

const Feature = ({
    title,
    description,
}) => {

    return (

        <div
            className="
                flex
                items-start
                gap-3
            "
        >

            <div
                className="
                    mt-0.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    ring-1
                    ring-white/10
                "
            >

                <ShieldCheck size={16} />

            </div>


            <div>

                <h3
                    className="
                        text-sm
                        font-semibold
                    "
                >
                    {title}
                </h3>


                <p
                    className="
                        mt-0.5
                        text-xs
                        leading-5
                        text-blue-100/75
                    "
                >
                    {description}
                </p>

            </div>

        </div>
    );
};


export default Login;