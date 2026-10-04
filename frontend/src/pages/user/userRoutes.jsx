import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import MailUser from "./MailUser";
import Profile from "./Profile";
import Settings from "./Setting";
import ComposeModal from "../../components/mail/ComposeModal";

const UserRoutes = () => {

    return (
        <Routes>

            {/* =====================================================
                USER MAIN LAYOUT
            ====================================================== */}

            <Route element={<MainLayout />}>

                {/* /user */}
                <Route
                    index
                    element={
                        <Navigate
                            to="/user/mail?Folder=inbox"
                            replace
                        />
                    }
                />

                {/* =================================================
                    MAILBOX
                ================================================== */}

                <Route
                    path="/*"
                    element={<MailUser />}
                />

                {/* =================================================
                    COMPOSE
                ================================================== */}

                <Route
                    path="compose"
                    element={<ComposeModal />}
                />

                {/* =================================================
                    PROFILE
                ================================================== */}

                <Route
                    path="profile"
                    element={<Profile />}
                />

                {/* =================================================
                    SETTINGS
                ================================================== */}

                <Route
                    path="settings"
                    element={<Settings />}
                />

                {/* =================================================
                    OLD ROUTES
                ================================================== */}

                <Route
                    path="inbox"
                    element={
                        <Navigate
                            to="/user/mail?Folder=inbox"
                            replace
                        />
                    }
                />

                <Route
                    path="sent"
                    element={
                        <Navigate
                            to="/user/mail?Folder=sent"
                            replace
                        />
                    }
                />

                <Route
                    path="drafts"
                    element={
                        <Navigate
                            to="/user/mail?Folder=drafts"
                            replace
                        />
                    }
                />

                <Route
                    path="trash"
                    element={
                        <Navigate
                            to="/user/mail?Folder=trash"
                            replace
                        />
                    }
                />

                {/* =================================================
                    FALLBACK
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/user/mail?Folder=inbox"
                            replace
                        />
                    }
                />

            </Route>

        </Routes>
    );
};

export default UserRoutes;