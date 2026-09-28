import { loginUser, registerUser } from "../api.js";

const AUTH_KEY = "darkmail_auth";

/* ----------------------------- */
/* Helper: Safe Parse Function   */
/* ----------------------------- */
function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    // console.log('raw data',JSON.parse(raw));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ----------------------------- */
/* Auth Utility                  */
/* ----------------------------- */
export const auth = {
  /* ✅ Check authentication */
  isAuthenticated() {
    const data = getStoredAuth();
    if (!data?.token) return false;

    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      this.logout();
      return false;
    }

    return true;
  },

  /* ✅ Login */
  async login(email, password) {
    
    try {
      
      const response = await loginUser(email, password);
      // console.log("frontend response data:",response);
      const payload = response?.data;
      // console.log("frontend payload data:",payload);
      if (!payload?.user || !payload?.token) {
        throw new Error("Invalid login response from server");
      }

      const { user, token, expiresAt } = payload;
      // console.log("frontend auth data:",user); 
      const authData = {
        token,
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role?.toUpperCase() || "USER",
        expiresAt:
          expiresAt ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      // console.log("auth data:",authData);

      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Login failed",
      };
    }
  },

  /* ✅ Register */
  async register(email, password) {
    try {
      const response = await registerUser(email, password);

      const payload = response?.data?.data || response?.data;

      if (!payload?.user || !payload?.token) {
        throw new Error("Invalid registration response");
      }

      const { user, token, expiresAt } = payload;

      const authData = {
        token,
        email: user.email,
        role: user.role?.toUpperCase() || "USER",
        expiresAt:
          expiresAt ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Registration failed",
      };
    }
  },

  /* ✅ Logout */
  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  /* ✅ Get Current User */
  getCurrentUser() {
    const data = getStoredAuth();
    if (!data) return null;
    // console.log("getCurrent auth User data:",data);
    return {
      name: data.name,
      id : data.id || data._id,
      email: data.email,
      role: data.role,
    };
  },

  /* ✅ Get Token */
  getToken() {
    const data = getStoredAuth();
    return data?.token || null;
  },

  /* ✅ Role Check */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "ADMIN";
  },

  isUser(){
    const user = this.getCurrentUser();
    return user?.role;
  },
};
