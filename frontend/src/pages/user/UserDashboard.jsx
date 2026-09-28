import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {

    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-7xl">

                <div className="rounded-2xl bg-white p-8 shadow-sm">

                    <p className="text-sm font-medium text-blue-600">
                        DARKMAIL
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Your DarkMail mailbox is ready.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default UserDashboard;