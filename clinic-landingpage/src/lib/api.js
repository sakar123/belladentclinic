// Single source: Clinic API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_CLINIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const joinUrl = (base, path) => {
    const b = (base || '').replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
};

const apiFetch = async (endpoint, options = {}) => {
    if (!API_BASE_URL) {
        const hint = 'Set NEXT_PUBLIC_CLINIC_API_BASE_URL to the Clinic API origin, e.g., http://localhost:5112';
        console.error('API base URL is undefined. ' + hint);
        throw new Error('API base URL is undefined. ' + hint);
    }

    const url = joinUrl(API_BASE_URL, endpoint);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (API_KEY) {
        headers['X-Clinic-Key'] = API_KEY;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error from API (${url}):`, errorBody);
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const bookAppointment = (data) => {
    return apiFetch('/api/LandingPage/appointment', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const getReviews = () => {
    return apiFetch('/api/landingpage/reviews');
};

export const getAppointments = () => {
    return apiFetch('/api/Appointment');
};
