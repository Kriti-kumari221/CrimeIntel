import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Crimes ──────────────────────────────────────────────────
export const fetchCrimes = (limit = 100) =>
    api.get('/crimes', { params: { limit } }).then(r => r.data);

export const fetchLatestCrimes = () =>
    api.get('/crimes/latest').then(r => r.data);

export const filterCrimes = (params) =>
    api.get('/crimes/filter', { params }).then(r => r.data);

export const fetchHeatmapData = (limit = 2000) =>
    api.get('/crimes/heatmap', { params: { limit } }).then(r => r.data);

export const fetchMeta = () =>
    api.get('/crimes/meta').then(r => r.data);

// ── Stats ───────────────────────────────────────────────────
export const fetchStatsByType = () =>
    api.get('/stats/by-type').then(r => r.data);

export const fetchStatsByDistrict = () =>
    api.get('/stats/by-district').then(r => r.data);

export const fetchTrend = (interval = 'day') =>
    api.get('/stats/trend', { params: { interval } }).then(r => r.data);

export const fetchTopDangerous = (k = 5) =>
    api.get('/stats/top-dangerous', { params: { k } }).then(r => r.data);

export const fetchPeakHours = () =>
    api.get('/stats/peak-hours').then(r => r.data);

export const fetchAnomalies = () =>
    api.get('/stats/anomalies').then(r => r.data);

// ── ML ──────────────────────────────────────────────────────
export const fetchRiskScores = () =>
    api.get('/ml/risk-scores').then(r => r.data);

export const fetchRiskScore = (district) =>
    api.get(`/ml/risk-score/${district}`).then(r => r.data);

export const fetchExplanation = (district) =>
    api.get(`/ml/explain/${district}`).then(r => r.data);

export default api;
