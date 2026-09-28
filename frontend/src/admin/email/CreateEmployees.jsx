import { useState } from "react";
import { createEmployee } from "../../api";

const DOMAIN = "@darkmail.com";

export default function CreateEmployee() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    personalEmail:"",
    password: "",
    department: "",
    role: "",
    hireDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const email = `${form.username.toLowerCase()}${DOMAIN}`;

      await createEmployee({
        ...form,
        email, // 🔥 auto generated email
      });

      setSuccess("Employee created successfully!");

      setForm({
        name: "",
        username: "",
        personalEmail:"",
        password: "",
        department: "",
        role: "",
        hireDate: "",
        isActive: true,
      });
    } catch (err) {
      setError(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Employee Account
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4">

          {/* Name */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Email will be:{" "}
              <span className="text-indigo-400">
                {form.username
                  ? form.username.toLowerCase() + DOMAIN
                  : "username@darkmail.com"}
              </span>
            </p>
          </div>

          {/* Personal Email */}
          <input
            type="email"
            name="personalEmail"
            value={form.personalEmail}
            onChange={handleChange}
            placeholder="Personal Email (optional)"
            className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />  

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Department */}
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Role */}
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Role (e.g. Developer, HR)"
            className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Hire Date */}
          <input
            type="date"
            name="hireDate"
            value={form.hireDate}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Active Toggle */}
          <label className="flex items-center gap-3 mt-2 text-gray-300">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Active Employee
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </form>

        {success && (
          <div className="mt-4 text-green-400 text-center text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-400 text-center text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
