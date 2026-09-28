import { useState } from "react";
import React from 'react';
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { Login } from "./pages/Login";
import { auth } from "./utils/auth";

/* USER */
import UserRoutes from "./user/userRoutes";
import Email from "./user/inbox/InboxList";
import { InboxLayout } from "./user/InboxLayout";
import {ComposeModal} from "./user/compose/ComposeModal";
import Trash from "./components/Trash";
// import { Analytics } from "@vercel/analytics/next"

import { Settings } from "./components/Settings";

/* ADMIN */
import AdminDashboard from "./admin/AdminDashboard";
import AdminCompose from "./admin/email/AdminCompose";
import CreateEmail from "./admin/email/CreateEmployees";
import { AdminRoute } from "./utils/AdminRoutes";

function ProtectedApp({ setIsAuthenticated }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (

    <Routes>

      {/* USER */}
      <Route path="/user/*" element={<UserRoutes />}>

        {/* Default */}
        <Route index element={<InboxLayout />} />

        {/* Inbox */}
        <Route path="inbox" element={<InboxLayout />} />

        {/* Compose */}
        <Route path="compose" element={<ComposeModal />} />

        {/* Sent */}
        <Route path="sent" element={<Email />} />

        {/* Drafts */}
        <Route path="drafts" element={<Email />} />

        {/* Trash */}
        <Route path="trash" element={<Trash />} />

      </Route>

      {/* settings */}
      <Route path="settings" element={ <Settings /> } />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/email"
        element={
          <AdminRoute>
            <CreateEmail />
            <AdminCompose />
          </AdminRoute>
        }
      />

      {/* DEFAULT */}
      <Route path="/*" element={<Navigate to="/user" />} />

      

    </Routes>

  );

}

/* ROOT */

export function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    auth.isAuthenticated()
  );

  return (

    <Routes>

      <Route
        path="/login"
        element={
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        }
      />

      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <ProtectedApp setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

    </Routes>

  );

}