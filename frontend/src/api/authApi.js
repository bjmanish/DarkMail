import api from "./axios";

export const loginApi = async ({email, password}) => {
    const response = await api.post("/auth/login", {
        email,
        password
    });
    // console.log(response.data);
    return response.data;
};

export const changePasswordApi = async ({
    currentPassword,
    newPassword,
    confirmPassword,
    }) => {

        const response = await api.post("/auth/change-password", {
            currentPassword,
            newPassword,
            confirmPassword,
        }
    );

    return response.data;
};

export const getMeApi = async () => {
    const response = await api.get("/auth/me");

    return response.data;
};