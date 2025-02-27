// export const PROD_MODE = process.env.NODE_ENV === "production"; // Auto-detect env
export const PROD_MODE = process.env.NODE_ENV === "production" ? true : true;//set this way so i can switch from true to false in dev but also w failsafe in case I forget to switch from false to true before eb deploy
export const PROD_URL = "https://api.arabuilds.com/api";
export const DEV_URL = "http://localhost:5000/api";

export const API_BASE_URL = PROD_MODE ? PROD_URL : DEV_URL;