import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import Inbox from "./Inbox";
import Sent from "./Sent";
import Drafts from "./Drafts";
import Trash from "./Trash";
import Profile from "./Profile";
import MessageView from "./MessageView";
import MessageViewer from "../../components/mail/MessageViewer";
import UserDashboard from "./UserDashboard";

const UserRoutes = () => {

    return (
        <Routes>

            <Route
                element={<MainLayout />}
            >   

                <Route
                    index
                    element={<Navigate to="/user/inbox" replace />}
                />

                <Route
                    path="inbox"
                    element={<Inbox />}
                />

                <Route
                    path="sent"
                    element={<Sent />}
                />

                <Route
                    path="drafts"
                    element={<Drafts />}
                />

                <Route
                    path="trash"
                    element={<Trash />}
                />

                <Route
                    path="message/:messageId"
                    element={<MessageView />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/user"
                            replace
                        />
                    }
                />

            </Route>

            <Route
              path="me"
              element={<UserDashboard />}
            />

            <Route
                path="profile"
                element={<Profile />}
            />

        </Routes>
    );
};

export default UserRoutes;