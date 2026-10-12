import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AdminRoutes
    from "./pages/admin/AdminRoutes";

import UserRoutes from  "./pages/user/userRoutes";


const App = () => {

    return (

        <Routes>

            {/* LOGIN */}

            <Route
                path="/login"
                element={
                    <Login />
                }
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
            />


            {/* ADMIN */}

            <Route
                path="/admin/*"
                element={
                    <AdminRoutes />
                }
            />


            {/* USER / EMPLOYEE */}

            <Route
                path="/user/*"
                element={
                    <UserRoutes />
                }
            />


            {/* ROOT */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* FALLBACK */}

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