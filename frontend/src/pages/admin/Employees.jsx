import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    deleteEmployeeApi,
    getEmployeesApi
} from "../../api/adminApi";

const Employees = () => {

    const navigate = useNavigate();

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("ALL");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [deletingId, setDeletingId] =
        useState(null);

    const loadEmployees = useCallback(
        async () => {

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
                    "Employee loading error:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load employees."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );

    useEffect(() => {

        loadEmployees();

    }, [loadEmployees]);

    const filteredEmployees = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return employees.filter(
            (employee) => {

                const matchesSearch =
                    !searchValue ||
                    employee.name
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    employee.email
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    employee.employeeId
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    employee.department
                        ?.toLowerCase()
                        .includes(searchValue);

                const matchesRole =
                    roleFilter === "ALL" ||
                    employee.role === roleFilter;

                const matchesStatus =
                    statusFilter === "ALL" ||
                    (
                        statusFilter === "ACTIVE" &&
                        employee.isActive
                    ) ||
                    (
                        statusFilter === "INACTIVE" &&
                        !employee.isActive
                    );

                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            }
        );

    }, [
        employees,
        search,
        roleFilter,
        statusFilter
    ]);

    const handleDelete = async (
        employee
    ) => {

        const confirmed =
            window.confirm(
                `Delete employee "${employee.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                employee._id
            );

            const response =
                await deleteEmployeeApi(
                    employee._id
                );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to delete employee"
                );

            }

            setEmployees(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item._id !==
                            employee._id
                    )
            );

        } catch (error) {

            console.error(
                "Delete employee error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to delete employee."
            );

        } finally {

            setDeletingId(null);

        }

    };

    const getInitial = (name) => {

        return (
            name
                ?.charAt(0)
                ?.toUpperCase() ||
            "U"
        );

    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <header className="border-b border-gray-200 bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Administration
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-gray-900">
                            Employees
                        </h1>

                    </div>

                    <div className="flex gap-2">

                        <NavLink
                            to="/admin"
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/admin/employees/create"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            + Add Employee
                        </NavLink>

                    </div>

                </div>

            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

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

                {/* Filters */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="grid gap-3 md:grid-cols-4">

                        {/* Search */}
                        <div className="md:col-span-2">

                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Name, email, employee ID..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        {/* Role */}
                        <div>

                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                Role
                            </label>

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="ALL">
                                    All Roles
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                                <option value="USER">
                                    User
                                </option>

                            </select>

                        </div>

                        {/* Status */}
                        <div>

                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                            >

                                <option value="ALL">
                                    All Status
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* Summary */}
                <div className="mt-4 flex items-center justify-between">

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-700">
                            {filteredEmployees.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-700">
                            {employees.length}
                        </span>{" "}
                        employees
                    </p>

                    <button
                        onClick={loadEmployees}
                        disabled={loading}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        ↻ Refresh
                    </button>

                </div>

                {/* Table */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {loading ? (

                        <div className="divide-y divide-gray-100">

                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="flex gap-4 p-5"
                                    >

                                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                                        <div className="flex-1">

                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />

                                            <div className="mt-2 h-3 w-60 animate-pulse rounded bg-gray-200" />

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    ) : filteredEmployees.length === 0 ? (

                        <div className="px-5 py-16 text-center">

                            <div className="text-5xl">
                                👥
                            </div>

                            <h2 className="mt-4 font-semibold text-gray-800">
                                No employees found
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your search or filters.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* Desktop */}
                            <div className="hidden overflow-x-auto lg:block">

                                <table className="w-full text-left">

                                    <thead className="border-b border-gray-100 bg-gray-50">

                                        <tr>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Employee
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Employee ID
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Department
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Role
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {filteredEmployees.map(
                                            (employee) => (

                                                <tr
                                                    key={employee._id}
                                                    className="transition hover:bg-gray-50"
                                                >

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">

                                                                {getInitial(
                                                                    employee.name
                                                                )}

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                                    {employee.name}
                                                                </p>

                                                                <p className="truncate text-xs text-gray-500">
                                                                    {employee.email}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {employee.employeeId}
                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <p className="text-sm text-gray-700">
                                                            {employee.department || "—"}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            {employee.designation || "—"}
                                                        </p>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                employee.role === "ADMIN"
                                                                    ? "bg-orange-50 text-orange-700"
                                                                    : "bg-blue-50 text-blue-700"
                                                            }`}
                                                        >
                                                            {employee.role}
                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/admin/employees/${employee._id}/edit`
                                                                    )
                                                                }
                                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        employee
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    employee._id
                                                                }
                                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                {deletingId ===
                                                                employee._id
                                                                    ? "Deleting..."
                                                                    : "Delete"
                                                                }
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* Mobile */}
                            <div className="divide-y divide-gray-100 lg:hidden">

                                {filteredEmployees.map(
                                    (employee) => (

                                        <div
                                            key={employee._id}
                                            className="p-4"
                                        >

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                                    {getInitial(
                                                        employee.name
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-start justify-between gap-2">

                                                        <div>

                                                            <p className="font-semibold text-gray-900">
                                                                {employee.name}
                                                            </p>

                                                            <p className="mt-0.5 break-all text-xs text-gray-500">
                                                                {employee.email}
                                                            </p>

                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

                                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">

                                                        <div>

                                                            <p className="text-gray-400">
                                                                Employee ID
                                                            </p>

                                                            <p className="mt-1 font-medium text-gray-700">
                                                                {employee.employeeId}
                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-gray-400">
                                                                Role
                                                            </p>

                                                            <p className="mt-1 font-medium text-gray-700">
                                                                {employee.role}
                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-gray-400">
                                                                Department
                                                            </p>

                                                            <p className="mt-1 font-medium text-gray-700">
                                                                {employee.department || "—"}
                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-gray-400">
                                                                Designation
                                                            </p>

                                                            <p className="mt-1 font-medium text-gray-700">
                                                                {employee.designation || "—"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                    <div className="mt-4 flex gap-2">

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/employees/${employee._id}/edit`
                                                                )
                                                            }
                                                            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    employee
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                employee._id
                                                            }
                                                            className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                                                        >
                                                            {deletingId ===
                                                            employee._id
                                                                ? "Deleting..."
                                                                : "Delete"
                                                            }
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </>

                    )}

                </div>

            </main>

        </div>
    );
};

export default Employees;