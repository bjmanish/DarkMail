import api from "./axios";

export const getEmployeesApi = async () => {
    const response = await api.get("/employees");
    return response.data;
};

export const createEmployeeApi = async (employeeData) => {
    const response = await api.post("/employees", employeeData);
    return response.data;
};

export const updateEmployeeApi = async (employeeId, employeeData) => {
    const response = await api.put(`/employees/${employeeId}`, employeeData);
    return response.data;
};

export const deleteEmployeeApi = async (employeeId) => {
    const response = await api.delete(`/employees/${employeeId}`);
    return response.data;
};