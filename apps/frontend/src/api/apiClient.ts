import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3001';
const WORKERS_URL = import.meta.env.VITE_API_WORKERS_URL || 'http://localhost:3002';
const REFERRALS_URL = import.meta.env.VITE_API_REFERRALS_URL || 'http://localhost:3003';
const ASSISTANCE_URL = import.meta.env.VITE_API_ASSISTANCE_URL || 'http://localhost:3004';
const REPORTS_URL = import.meta.env.VITE_API_REPORTS_URL || 'http://localhost:3005';

const authApi = axios.create({ baseURL: AUTH_URL });
export const workersApi = axios.create({ baseURL: WORKERS_URL });
export const referralsApi = axios.create({ baseURL: REFERRALS_URL });
export const assistanceApi = axios.create({ baseURL: ASSISTANCE_URL });
export const reportsApi = axios.create({ baseURL: REPORTS_URL });

export default authApi;
