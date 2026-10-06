import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginApi,
} from "../api/authApi";


const AuthContext =
    createContext(null);


/* =========================================================
   STORAGE KEYS
========================================================= */

const TOKEN_KEY =
    "darkmail_auth";

const USER_KEY =
    "darkmail_user";

const SESSION_KEY =
    "darkmail_session_id";


/* =========================================================
   PROVIDER
========================================================= */

export const AuthProvider = ({
    children,
}) => {

    /* -----------------------------------------------------
       INITIAL USER
    ----------------------------------------------------- */

    const [
        user,
        setUser,
    ] = useState(() => {

        try {

            const savedUser =
                localStorage.getItem(
                    USER_KEY
                );

            return savedUser
                ? JSON.parse(savedUser)
                : null;

        } catch (error) {

            console.error(
                "Failed to restore user:",
                error
            );

            return null;
        }
    });


    /* -----------------------------------------------------
       INITIAL TOKEN
    ----------------------------------------------------- */

    const [
        token,
        setToken,
    ] = useState(() => {

        try {

            return (
                localStorage.getItem(
                    TOKEN_KEY
                ) || ""
            );

        } catch {

            return "";
        }
    });


    /* -----------------------------------------------------
       AUTH READY
    ----------------------------------------------------- */

    const [
        loading,
        setLoading,
    ] = useState(false);


    /* =====================================================
       SAVE AUTH DATA
    ===================================================== */

    const saveAuthData = (
        authData
    ) => {

        if (!authData) {
            return;
        }


        /*
         * Accept different possible
         * backend response structures.
         */

        const receivedToken =
            authData.token ||
            authData.accessToken ||
            authData.data?.token ||
            authData.data?.accessToken ||
            "";


        const receivedUser =
            authData.user ||
            authData.data?.user ||
            authData.employee ||
            authData.data?.employee ||
            null;


        const receivedSessionId =
            authData.sessionId ||
            authData.data?.sessionId ||
            authData.session_id ||
            authData.data?.session_id ||
            "";


        /* -------------------------------------------------
           TOKEN
        ------------------------------------------------- */

        if (receivedToken) {

            setToken(
                receivedToken
            );

            localStorage.setItem(
                TOKEN_KEY,
                receivedToken
            );
        }


        /* -------------------------------------------------
           USER
        ------------------------------------------------- */

        if (receivedUser) {

            setUser(
                receivedUser
            );

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(
                    receivedUser
                )
            );
        }


        /* -------------------------------------------------
           SESSION ID
        ------------------------------------------------- */

        if (receivedSessionId) {

            localStorage.setItem(
                SESSION_KEY,
                receivedSessionId
            );

            /*
             * Also keep generic key
             * for compatibility.
             */

            localStorage.setItem(
                "sessionId",
                receivedSessionId
            );
        }


        return {
            token:
                receivedToken,

            user:
                receivedUser,

            sessionId:
                receivedSessionId,
        };
    };


    /* =====================================================
       LOGIN
    ===================================================== */

    const login = async ({
        email,
        password,
    }) => {

        setLoading(true);

        try {

            const response =
                await loginApi({
                    email,
                    password,
                });


            // console.log(
            //     "LOGIN RESPONSE:",
            //     response
            // );


            if (
                !response ||
                response.success === false
            ) {

                throw new Error(
                    response?.message ||
                    "Login failed."
                );
            }


            const authData =
                saveAuthData(
                    response
                );


            /*
             * If backend doesn't provide
             * a session ID, generate a
             * client identifier.
             *
             * IMPORTANT:
             * This is only for URL/state
             * tracking, NOT authentication.
             */

            if (
                !authData?.sessionId
            ) {

                let sessionId =
                    localStorage.getItem(
                        SESSION_KEY
                    );

                if (!sessionId) {

                    sessionId =
                        crypto.randomUUID();

                    localStorage.setItem(
                        SESSION_KEY,
                        sessionId
                    );

                    localStorage.setItem(
                        "sessionId",
                        sessionId
                    );
                }
            }


            return response;

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            throw error;

        } finally {

            setLoading(false);
        }
    };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logout = () => {

        setUser(null);

        setToken("");

        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );

        localStorage.removeItem(
            SESSION_KEY
        );

        localStorage.removeItem(
            "sessionId"
        );
    };


    /* =====================================================
       RESTORE AUTH STATE
    ===================================================== */

    useEffect(() => {

        try {

            const savedToken =
                localStorage.getItem(
                    TOKEN_KEY
                );

            const savedUser =
                localStorage.getItem(
                    USER_KEY
                );


            if (
                savedToken &&
                !token
            ) {

                setToken(
                    savedToken
                );
            }


            if (
                savedUser &&
                !user
            ) {

                setUser(
                    JSON.parse(
                        savedUser
                    )
                );
            }

        } catch (error) {

            console.error(
                "Auth restore error:",
                error
            );
        }

    }, []);


    /* =====================================================
       CONTEXT
    ===================================================== */

    const value = {

        user,

        token,

        loading,

        isAuthenticated:
            Boolean(token && user),

        login,

        logout,

        setUser,

    };


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};


/* =========================================================
   HOOK
========================================================= */

export const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};


export default AuthContext;