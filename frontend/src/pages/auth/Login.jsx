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

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            return;
        }

        try {

            setLoading(true);

            const employee = await login(
                formData.email,
                formData.password
            );

            // console.log("Login data: ",employee)

            if (employee.role === "ADMIN") {
                navigate("/admin", {
                    replace: true
                });
            } else {
                navigate("/user", {
                    replace: true
                });
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

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

                <div className="rounded-2xl bg-white p-8 shadow-2xl">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-gray-900">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Sign in to continue to DarkMail
                        </p>

                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@darkmail.com"
                                autoComplete="email"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }
                        </button>

                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-5 text-center">

                        <p className="text-xs text-gray-400">
                            DarkMail Internal Communication System
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;