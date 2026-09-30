import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Login from "./pages/auth/Login";

import AdminRoutes from "./pages/admin/AdminRoutes";

import UserRoutes from "./pages/user/userRoutes";

import ProtectedRoute from "./components/common/ProtectedRoute";

const App = () => {

    return (
        <Routes>

            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Admin */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN"]}
                    >
                        <AdminRoutes />
                    </ProtectedRoute>
                }
            />

            {/* User */}
            <Route
                path="/user/*"
                element={
                    <ProtectedRoute
                        allowedRoles={["USER", "ADMIN"]}
                    >
                        <UserRoutes />
                    </ProtectedRoute>
                }
            />

            {/* Root */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            {/* Unknown */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
};

export default App;