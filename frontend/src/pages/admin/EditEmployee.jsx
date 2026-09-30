import { useEffect, useState } from "react";

import {
    NavLink,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getEmployeesApi,
    updateEmployeeApi
} from "../../api/adminApi";

const EditEmployee = () => {

    const {
        id
    } = useParams();

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
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadEmployee = async () => {

            try {

                setLoading(true);

                const response =
                    await getEmployeesApi();

                if (!response.success) {
                    throw new Error(
                        response.message
                    );
                }

                const employee =
                    response.employees?.find(
                        item => item._id === id
                    );

                if (!employee) {
                    throw new Error(
                        "Employee not found."
                    );
                }

                setFormData({
                    employeeId:
                        employee.employeeId || "",
                    name:
                        employee.name || "",
                    email:
                        employee.email || "",
                    personalEmail:
                        employee.personalEmail || "",
                    password: "",
                    role:
                        employee.role || "USER",
                    department:
                        employee.department || "",
                    designation:
                        employee.designation || "",
                    hireDate:
                        employee.hireDate
                            ? employee.hireDate.substring(0, 10)
                            : "",
                    isActive:
                        employee.isActive !== false
                });

            } catch (error) {

                console.error(
                    "Load employee error:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load employee."
                );

            } finally {

                setLoading(false);

            }

        };

        loadEmployee();

    }, [id]);

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

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setSaving(true);

            const data = {
                ...formData
            };

            // Don't send an empty password
            if (!data.password) {
                delete data.password;
            }

            const response =
                await updateEmployeeApi(
                    id,
                    data
                );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to update employee."
                );

            }

            navigate(
                "/admin/employees"
            );

        } catch (error) {

            console.error(
                "Update employee error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to update employee."
            );

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading employee...
                    </p>

                </div>

            </div>
        );

    }

    return (
        <div className="min-h-screen bg-gray-100">

            <header className="border-b border-gray-200 bg-white">

                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Administration
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-gray-900">
                            Edit Employee
                        </h1>

                    </div>

                    <NavLink
                        to="/admin/employees"
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        ← Employees
                    </NavLink>

                </div>

            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {error && (
                        <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="p-5"
                    >

                        <div className="grid gap-5 md:grid-cols-2">

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Employee ID
                                </label>

                                <input
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"
                                }
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
};

export default EditEmployee;