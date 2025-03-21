// export const PROD_MODE = process.env.NODE_ENV === "production"; // Auto-detect env
export const PROD_MODE = true;
export const PROD_URL = "https://api.arabuilds.com/api";
// export const DEV_URL = "http://localhost:5000/api";
export const DEV_URL = "http://192.168.0.7:5000/api"; //for mobile testing

export const API_BASE_URL = PROD_MODE ? PROD_URL : DEV_URL;