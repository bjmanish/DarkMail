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

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData(
            previous => ({
                ...previous,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value
            })
        );

        if (error) {
            setError("");
        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.employeeId ||
            !formData.name ||
            !formData.email ||
            !formData.password
        ) {

            setError(
                "Employee ID, name, email and password are required."
            );

            return;
        }

        try {

            setLoading(true);

            const response =
                await createEmployeeApi(
                    formData
                );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to create employee"
                );

            }

            setSuccess(
                "Employee created successfully."
            );

            setTimeout(() => {

                navigate(
                    "/admin/employees"
                );

            }, 800);

        } catch (error) {

            console.error(
                "Create employee error:",
                error
            );

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

            <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-100 p-5">

                        <h2 className="font-bold text-gray-900">
                            Employee Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Create a new DarkMail employee account.
                        </p>

                    </div>

                    {error && (
                        <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mx-5 mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="p-5"
                    >

                        <div className="grid gap-5 md:grid-cols-2">

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Employee ID *
                                </label>

                                <input
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    placeholder="EMP001"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Full Name *
                                </label>

                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email *
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@darkmail.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Personal Email
                                </label>

                                <input
                                    type="email"
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleChange}
                                    placeholder="john@gmail.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Password *
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                >

                                    <option value="USER">
                                        User
                                    </option>

                                    <option value="ADMIN">
                                        Admin
                                    </option>

                                </select>

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Department
                                </label>

                                <input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="IT"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Designation
                                </label>

                                <input
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Software Engineer"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Hire Date
                                </label>

                                <input
                                    type="date"
                                    name="hireDate"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            <div className="flex items-center">

                                <label className="flex cursor-pointer items-center gap-3">

                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={
                                            formData.isActive
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />

                                    <span className="text-sm font-medium text-gray-700">
                                        Account is active
                                    </span>

                                </label>

                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">

                            <NavLink
                                to="/admin/employees"
                                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </NavLink>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Employee"
                                }
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
};

export default CreateEmployee;