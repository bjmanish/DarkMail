import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    loginApi,
    getMeApi
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAuthentication = async () => {

            const token = localStorage.getItem("darkmail_auth");

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const response = await getMeApi();

                if (response.success) {
                    setUser(response.employee);
                }

            } catch (error) {

                console.error(
                    "Authentication check failed:",
                    error.response?.data || error.message
                );

                localStorage.removeItem("darkmail_auth");
                setUser(null);

            } finally {

                setLoading(false);

            }
        };

        checkAuthentication();

    }, []);

    const login = async (email, password) => {

    const response = await loginApi(email, password);

    // console.log("LOGIN RESPONSE:", response);

    if (!response.success) {
        throw new Error(
            response.message || "Login failed"
        );
    }

    if (!response.token) {
        throw new Error("Login successful but JWT token was not returned.");
    }

    if (!response.user) {
        throw new Error("Login successful but employee information was not returned.");
    }

    localStorage.setItem(
        "darkmail_auth",
        response.token
    );

    setUser(response.user);

    return response.user;
};

    const logout = () => {

        localStorage.removeItem("darkmail_auth");

        setUser(null);

    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};