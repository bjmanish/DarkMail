
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPasswordApi } from "../../api/authApi";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("The password reset link is invalid.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await resetPasswordApi({
                token,
                newPassword,
                confirmPassword,
            });

            setMessage(
                response.message || "Your password has been reset successfully."
            );

            setNewPassword("");
            setConfirmPassword("");

            // Redirect to login after displaying the success message.
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset your password. The link may have expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
                        🔐
                    </div>

                    <h1 className="text-2xl font-bold">
                        Reset Your Password
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Create a new password for your DarkMail account.
                        Your reset link must still be valid.
                    </p>
                </div>

                {message && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-emerald-700 bg-emerald-950/60 p-3 text-sm text-emerald-300"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            minLength={8}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Confirm New Password
                        </label>

                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            minLength={8}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                        />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                        />
                        Show passwords
                    </label>

                    <p className="text-xs text-slate-500">
                        Use at least 8 characters. Choose a password you
                        haven't used for another account.
                    </p>

                    <button
                        type="submit"
                        disabled={loading || Boolean(message)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                        ← Back to Login
                    </Link>
                </div>

                <p className="mt-8 text-center text-xs text-slate-500">
                    DarkMail · Secure Email Platform
                </p>
            </div>
        </div>
    );
}
