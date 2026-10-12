import api from "./axios";

// Login
export const loginApi = async ({ email, password }) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

// Get logged-in employee
export const getMeApi = async () => {
    const response = await api.get("/auth/me");

    return response.data;
};

// Change password (requires authentication)
export const changePasswordApi = async ({
    currentPassword,
    newPassword,
    confirmPassword,
}) => {
    const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
    });

    return response.data;
};

// Forgot password (public endpoint)
export const forgotPasswordApi = async ({ email }) => {
    const response = await api.post("/auth/forgot-password", {
        email,
    });
    console.log(response)
    return response.data;
};

// Reset password using the token from the email link (public endpoint)
export const resetPasswordApi = async ({
    token,
    newPassword,
    confirmPassword,
}) => {
    const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        {
            newPassword,
            confirmPassword,
        }
    );

    return response.data;
};