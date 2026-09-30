import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
import Employees from "./Employees";
import CreateEmployee from "./CreateEmployee";
import EditEmployee from "./EditEmployee";

const AdminRoutes = () => {

    return (
        <Routes>

            <Route
                index
                element={<AdminDashboard />}
            />

            <Route
                path="employees"
                element={<Employees />}
            />

            <Route
                path="employees/create"
                element={<CreateEmployee />}
            />

            <Route
                path="employees/:id/edit"
                element={<EditEmployee />}
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/admin"
                        replace
                    />
                }
            />

        </Routes>
    );
};

export default AdminRoutes;