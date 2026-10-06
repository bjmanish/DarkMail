import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate} from "react-router-dom";

import {
    getEmployeesApi
} from "../../api/adminApi";

import {
    useAuth
} from "../../context/AuthContext";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const loadEmployees = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getEmployeesApi();

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to load employees"
                );
            }

            setEmployees(
                response.employees || []
            );

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load employee data."
            );

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadEmployees();

    }, [loadEmployees]);

    const totalEmployees =
        employees.length;

    const activeEmployees =
        employees.filter(
            employee => employee.isActive
        ).length;

    const inactiveEmployees =
        employees.filter(
            employee => !employee.isActive
        ).length;

    const adminCount =
        employees.filter(
            employee => employee.role === "ADMIN"
        ).length;

    const userCount =
        employees.filter(
            employee => employee.role === "USER"
        ).length;

    const recentEmployees =
        [...employees]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            )
            .slice(0, 5);

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return "—";
        }

        return value.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getInitial = (name) => {

        return (
            name
                ?.charAt(0)
                ?.toUpperCase() ||
            "U"
        );
    };

    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <header className="border-b border-gray-200 bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
                            D
                        </div>

                        <div>

                            <h1 className="text-lg font-bold text-gray-900">
                                DarkMail
                            </h1>

                            <p className="text-xs text-gray-500">
                                Administration
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-gray-800">
                                {user?.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user?.email}
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                            {getInitial(user?.name)}
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 sm:block"
                        >
                            Logout
                        </button>

                    </div>

                    {/* ==========================================================
                LOGOUT MODAL
            ========================================================== */}

            {showLogoutModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-sm
                            rounded-2xl
                            bg-white
                            p-6
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-100
                                text-xl
                            "
                        >
                            🚪
                        </div>


                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Sign out?
                        </h2>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            Are you sure you want to sign out
                            of DarkMail?
                        </p>


                        <div
                            className="
                                mt-6
                                flex
                                flex-col-reverse
                                gap-2
                                sm:flex-row
                                sm:justify-end
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowLogoutModal(
                                        false
                                    )
                                }
                                className="
                                    rounded-lg
                                    border
                                    border-gray-300
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(true)}
                                className="
                                    rounded-lg
                                    bg-red-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-700
                                "
                            >
                                Sign Out
                            </button>

                        </div>

                    </div>

                </div>

            )}

                </div>

            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Welcome */}
                <div className="mb-6">

                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Admin Dashboard
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Welcome back, {user?.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Manage employees and monitor your
                        DarkMail system.
                    </p>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={loadEmployees}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Total */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Total Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {loading
                                        ? "—"
                                        : totalEmployees
                                    }
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                👥
                            </div>

                        </div>

                    </div>

                    {/* Active */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Active Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {loading
                                        ? "—"
                                        : activeEmployees
                                    }
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                                ✓
                            </div>

                        </div>

                    </div>

                    {/* Users */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Users
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-600">
                                    {loading
                                        ? "—"
                                        : userCount
                                    }
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                                👤
                            </div>

                        </div>

                    </div>

                    {/* Admins */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Administrators
                                </p>

                                <p className="mt-2 text-3xl font-bold text-orange-600">
                                    {loading
                                        ? "—"
                                        : adminCount
                                    }
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                🛡️
                            </div>

                        </div>

                    </div>

                </div>

                {/* Quick Actions */}
                <div className="mt-6">

                    <h3 className="mb-3 text-lg font-bold text-gray-900">
                        Quick Actions
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <NavLink
                            to="/admin/employees"
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                        >

                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                👥
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Manage Employees
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                Add, edit and manage employees.
                            </p>

                        </NavLink>

                        <NavLink
                            to="/admin/employees/create"
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                        >

                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                                ＋
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Add Employee
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                Create a new DarkMail account.
                            </p>

                        </NavLink>

                        <NavLink
                            to="/user"
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                        >

                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                                📧
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Open Mail
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                Open the DarkMail mailbox.
                            </p>

                        </NavLink>

                        <button
                            onClick={loadEmployees}
                            className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                        >

                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                ↻
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Refresh Data
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                Refresh employee statistics.
                            </p>

                        </button>

                    </div>

                </div>

                {/* Recent Employees */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                        <div>

                            <h3 className="font-bold text-gray-900">
                                Recent Employees
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                Recently created DarkMail accounts
                            </p>

                        </div>

                        <NavLink
                            to="/admin/employees"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View all
                        </NavLink>

                    </div>

                    {loading ? (

                        <div className="divide-y divide-gray-100">

                            {[1, 2, 3].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-4 p-5"
                                    >

                                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                                        <div className="flex-1">

                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />

                                            <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200" />

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    ) : recentEmployees.length === 0 ? (

                        <div className="px-5 py-12 text-center">

                            <div className="text-4xl">
                                👥
                            </div>

                            <p className="mt-3 font-medium text-gray-700">
                                No employees found
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-gray-100">

                            {recentEmployees.map(
                                (employee) => (

                                    <div
                                        key={employee._id}
                                        className="flex items-center gap-4 px-5 py-4"
                                    >

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                            {getInitial(
                                                employee.name
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {employee.name}
                                            </p>

                                            <p className="truncate text-xs text-gray-500">
                                                {employee.email}
                                            </p>

                                        </div>

                                        <div className="hidden text-right sm:block">

                                            <p className="text-xs text-gray-400">
                                                {formatDate(
                                                    employee.createdAt
                                                )}
                                            </p>

                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                employee.role === "ADMIN"
                                                    ? "bg-orange-50 text-orange-700"
                                                    : "bg-blue-50 text-blue-700"
                                            }`}
                                        >
                                            {employee.role}
                                        </span>

                                        <span
                                            className={`hidden rounded-full px-3 py-1 text-xs font-medium md:inline-flex ${
                                                employee.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {employee.isActive
                                                ? "Active"
                                                : "Inactive"
                                            }
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

                {/* Account Information */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                    <h3 className="font-bold text-gray-900">
                        Administrator Information
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                            <p className="text-xs text-gray-400">
                                Employee ID
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {user?.employeeId || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Email
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                                {user?.email || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Department
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {user?.department || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Designation
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {user?.designation || "—"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className="py-6 text-center">

                    <p className="text-xs text-gray-400">
                        DarkMail Internal Communication System 
                        v{import.meta.env.VITE_PACKAGE_VERSION }  {import.meta.env.VITE_PACKAGE_YEAR }
                    </p>

                </div>

            </main>

        </div>
    );
};

export default AdminDashboard;
