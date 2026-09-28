import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {

    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-7xl">

                <div className="rounded-2xl bg-white p-8 shadow-sm">

                    <p className="text-sm font-medium text-blue-600">
                        ADMIN DASHBOARD
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Manage DarkMail from your administrator dashboard.
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl bg-blue-50 p-5">
                            <p className="text-sm text-gray-500">
                                Role
                            </p>

                            <p className="mt-2 text-xl font-bold text-blue-700">
                                {user?.role}
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-50 p-5">
                            <p className="text-sm text-gray-500">
                                Department
                            </p>

                            <p className="mt-2 text-xl font-bold text-green-700">
                                {user?.department || "—"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-5">
                            <p className="text-sm text-gray-500">
                                Employee ID
                            </p>

                            <p className="mt-2 text-xl font-bold text-purple-700">
                                {user?.employeeId}
                            </p>
                        </div>

                        <div className="rounded-xl bg-orange-50 p-5">
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <p className="mt-2 text-xl font-bold text-orange-700">
                                Active
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;