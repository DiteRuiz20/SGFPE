import api from "./api";

export const getAllDebts = async () => {
    const response = await api.get("/api/personal/debts");
    return response.data;
};

export const getDebtsByUserId = async (userId) => {
    const response = await api.get(`/api/personal/debts/user/${userId}`);
    return response.data;
};

export const createDebt = async (debt) => {
    const formattedDebt = {
        ...debt,
        userId: localStorage.getItem('userId')
    };
    
    const response = await api.post("/api/personal/debts", formattedDebt);
    return response.data;
};

export const updateDebt = async (id, debt) => {
    const formattedDebt = {
        ...debt
    };
    
    const response = await api.put(`/api/personal/debts/${id}`, formattedDebt);
    return response.data;
};

export const deleteDebt = async (id) => {
    const response = await api.delete(`/api/personal/debts/${id}`);
    return response.data;
};




