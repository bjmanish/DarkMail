import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();

    const {
        login
    } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // Clear error while user is typing
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        const email = formData.email.trim();
        const password = formData.password;

        // Validation
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {

            setLoading(true);

            /*
             * login() returns the employee object
             *
             * Expected:
             * {
             *   id: "...",
             *   employeeId: "ADM001",
             *   name: "...",
             *   email: "...",
             *   role: "ADMIN"
             * }
             */

            const employee = await login(
                email,
                password
            );

            console.log(
                "DarkMail Login Employee:",
                employee
            );

            // Prevent undefined.role error
            if (!employee) {

                throw new Error(
                    "Login successful, but employee information was not returned by the server."
                );
            }

            if (!employee.role) {

                throw new Error(
                    "User role was not returned by the server."
                );
            }

            const role = employee.role.toUpperCase();

            // Admin
            if (role === "ADMIN") {

                navigate("/admin", {
                    replace: true
                });

                return;
            }

            // Normal User
            if (role === "USER") {

                navigate("/user", {
                    replace: true
                });

                return;
            }

            // Unknown role
            throw new Error(
                `Unsupported user role: ${employee.role}`
            );

        } catch (error) {

            console.error(
                "DarkMail Login Error:",
                error
            );

            const backendMessage =
                error?.response?.data?.message;

            setError(
                backendMessage ||
                error?.message ||
                "Unable to sign in. Please check your email and password."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                {/* Logo / Header */}
                <div className="mb-8 text-center text-white">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl">

                        <span className="text-2xl font-bold">
                            D
                        </span>

                    </div>

                    <h1 className="text-3xl font-bold">
                        DarkMail
                    </h1>

                    <p className="mt-2 text-sm text-blue-200">
                        Secure Internal Mail System
                    </p>

                </div>

                {/* Login Card */}
                <div className="rounded-2xl bg-white p-8 shadow-2xl">

                    {/* Title */}
                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-gray-900">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Sign in to continue to DarkMail
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >

                            <span className="mt-0.5">
                                ⚠
                            </span>

                            <p>
                                {error}
                            </p>

                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@darkmail.com"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />

                        </div>

                        {/* Password */}
                        <div>

                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />

                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}

                        </button>

                    </form>

                    {/* Footer */}
                    <div className="mt-6 border-t border-gray-100 pt-5 text-center">

                        <p className="text-xs text-gray-400">
                            DarkMail Internal Communication System
                        </p>

                    </div>

                </div>

                {/* Bottom text */}
                <p className="mt-5 text-center text-xs text-blue-300/70">
                    Authorized users only
                </p>

            </div>

        </div>
    );
};

export default Login;