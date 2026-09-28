import {auth} from '../utils/auth';
import { Navigate, Outlet } from "react-router-dom";

import {InboxLayout} from './InboxLayout';

export default function UserRoutes() {

  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
    
  return <Outlet />;

}