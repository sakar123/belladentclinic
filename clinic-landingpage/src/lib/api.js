const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'X-Clinic-Key': API_KEY,
        ...options.headers,
    };

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