// export const PROD_MODE = process.env.NODE_ENV === "production"; // Auto-detect env
export const PROD_MODE = true;
export const PROD_URL = "http://ticketbook-backend-env.eba-eqn7ksmz.us-west-1.elasticbeanstalk.com/api";
export const DEV_URL = "http://localhost:5000/api";

export const API_BASE_URL = PROD_MODE ? PROD_URL : DEV_URL;