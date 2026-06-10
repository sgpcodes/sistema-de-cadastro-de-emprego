import axios from 'axios';

const WORKERS_URL = import.meta.env.VITE_API_WORKERS_URL || 'http://localhost:3002';
const REFERRALS_URL = import.meta.env.VITE_API_REFERRALS_URL || 'http://localhost:3003';
const ASSISTANCE_URL = import.meta.env.VITE_API_ASSISTANCE_URL || 'http://localhost:3004';
const AUTH_URL = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3001';

const authApi = axios.create({ baseURL: AUTH_URL });
export const workersApi = axios.create({ baseURL: WORKERS_URL });
export const referralsApi = axios.create({ baseURL: REFERRALS_URL });
export const assistanceApi = axios.create({ baseURL: ASSISTANCE_URL });

export default authApi;
