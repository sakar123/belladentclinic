// Single source: Clinic API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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

    // Perform an explicit CORS preflight (OPTIONS) before the actual request when cross-origin.
    try {
        if (typeof window !== 'undefined') {
            const targetOrigin = new URL(url).origin;
            const currentOrigin = window.location.origin;
            const isCrossOrigin = targetOrigin !== currentOrigin;
            if (isCrossOrigin) {
                const reqMethod = (options.method || 'GET').toUpperCase();
                const headerNames = Object.keys(headers || {}).map(h => h.toLowerCase());
                const preflightHeaders = {
                    'Access-Control-Request-Method': reqMethod,
                };
                if (headerNames.length) {
                    preflightHeaders['Access-Control-Request-Headers'] = headerNames.join(', ');
                }
                const preflightResp = await fetch(url, {
                    method: 'OPTIONS',
                    mode: 'cors',
                    headers: preflightHeaders,
                });
                if (!preflightResp.ok) {
                    const text = await preflightResp.text().catch(() => '');
                    throw new Error(`CORS preflight failed with status ${preflightResp.status}: ${text}`);
                }
            }
        }
    } catch (preErr) {
        console.error('CORS preflight error:', preErr);
        throw preErr;
    }

    const response = await fetch(url, { ...options, headers, mode: 'cors' });

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
