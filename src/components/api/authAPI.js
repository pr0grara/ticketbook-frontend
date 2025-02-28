import axios from "axios";
import { API_BASE_URL, PROD_MODE } from "../../config";

const authAPI = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Ensures cookies are sent with requests
});

export const logoutUser = async () => {
    await authAPI.post("/auth/logout");
    window.location.reload();
};

export const checkStatus = async () => {
    const status = await authAPI.get("/auth/status");
    return status.data;
}

export default authAPI;