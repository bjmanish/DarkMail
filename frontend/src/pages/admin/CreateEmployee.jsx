import { useState } from "react";

import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    createEmployeeApi
} from "../../api/adminApi";

const CreateEmployee = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        employeeId: "",
        name: "",
        email: "",
        personalEmail: "",
        password: "",
        role: "USER",
        department: "",
        designation: "",
        hireDate: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Validate required fields
        if (
            !formData.employeeId.trim() ||
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.personalEmail.trim() ||
            !formData.password
        ) {
            setError(
                "Employee ID, name, company email, personal email and password are required."
            );
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        // Validate email addresses
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(formData.email.trim())) {
            setError("Please enter a valid company email address.");
            return;
        }

        if (!emailPattern.test(formData.personalEmail.trim())) {
            setError("Please enter a valid personal email address.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                employeeId: formData.employeeId.trim().toUpperCase(),
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                personalEmail: formData.personalEmail.trim().toLowerCase(),
                department: formData.department.trim(),
                designation: formData.designation.trim()
            };

            const response = await createEmployeeApi(payload);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Unable to create employee."
                );
            }

            // Backend returns email.sent and email.message
            const emailSent = response.email?.sent === true;

            if (emailSent) {
                setSuccess(
                    `Employee created successfully. Welcome email sent to ${payload.personalEmail}.`
                );
            } else {
                setSuccess(
                    "Employee created successfully, but the welcome email could not be sent."
                );

                setError(
                    response.email?.message ||
                    "Check your SMTP configuration and backend logs."
                );
            }

            // Navigate after allowing the status to be read
            setTimeout(() => {
                navigate("/admin/employees");
            }, 2500);
        } catch (error) {
            console.error("Create employee error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to create employee."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Administration
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-gray-900">
                            Create Employee
                        </h1>
                    </div>

                    <NavLink
                        to="/admin/employees"
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        ← Employees
                    </NavLink>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h2 className="font-bold text-gray-900">
                            Employee Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Create a new DarkMail employee account.
                            A welcome email will be sent to the employee's
                            personal email address.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            role="alert"
                            className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {/* Success / Email Status */}
                    {success && (
                        <div
                            role="status"
                            className={`mx-5 mt-5 rounded-lg border px-4 py-3 text-sm ${
                                success.includes("could not be sent")
                                    ? "border-amber-200 bg-amber-50 text-amber-800"
                                    : "border-green-200 bg-green-50 text-green-700"
                            }`}
                        >
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="p-5"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Employee ID */}
                            <div>
                                <label
                                    htmlFor="employeeId"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Employee ID *
                                </label>

                                <input
                                    id="employeeId"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    placeholder="EMP001"
                                    required
                                    disabled={loading}
                                    autoComplete="off"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Full Name *
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    disabled={loading}
                                    autoComplete="name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Company Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Company Email *
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@darkmail.com"
                                    required
                                    disabled={loading}
                                    autoComplete="off"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Personal Email */}
                            <div>
                                <label
                                    htmlFor="personalEmail"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Personal Email *
                                </label>

                                <input
                                    id="personalEmail"
                                    type="email"
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleChange}
                                    placeholder="john@gmail.com"
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    The welcome email will be sent here.
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Initial Password *
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter initial password"
                                    required
                                    minLength={6}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum 6 characters. The password will
                                    not be included in the welcome email.
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Role
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="USER">
                                        User
                                    </option>

                                    <option value="ADMIN">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label
                                    htmlFor="department"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Department
                                </label>

                                <input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="IT"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Designation */}
                            <div>
                                <label
                                    htmlFor="designation"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Designation
                                </label>

                                <input
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Software Engineer"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Hire Date */}
                            <div>
                                <label
                                    htmlFor="hireDate"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Hire Date
                                </label>

                                <input
                                    id="hireDate"
                                    type="date"
                                    name="hireDate"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />

                                    <span className="text-sm font-medium text-gray-700">
                                        Account is active
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                            <NavLink
                                to="/admin/employees"
                                className={`rounded-lg border border-gray-200 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                                    loading
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                            >
                                Cancel
                            </NavLink>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating Employee..."
                                    : "Create Employee"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateEmployee;