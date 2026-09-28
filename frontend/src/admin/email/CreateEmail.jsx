import { useState } from "react";
import { createEmployee } from "../../api";

export default function CreateEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createEmployee({
        email,
        password,
        role: "EMPLOYEE", // optional
      });

      setSuccess("Employee account created successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Employee Account
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Employee Email"
            className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary Password"
            className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength={6}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Success Message */}
        {success && (
          <div className="mt-4 text-green-400 text-sm text-center">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
