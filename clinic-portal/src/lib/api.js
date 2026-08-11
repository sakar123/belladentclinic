import { authFetch, http } from "./http";
import { buildAdvancedOdontogramPayload } from "./odontogram/backend-to-advanced";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const EMPTY_ADVANCED_ODONTOGRAM_CHART = {
  version: "2.19",
  globals: {
    wisdomVisible: true,
    showBase: true,
    occlusalVisible: true,
    showHealthyPulp: true,
    edentulous: false,
  },
  teeth: {},
};

async function fetcher(url, options = {}) {
  let finalUrl = `${API_BASE_URL}${url}`;
  
  if (options.params) {
    const params = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const response = await authFetch(finalUrl, options);
  if (!response.ok) {
    const error = new Error(response.status === 401
      ? 'Unauthorized API request. Sign in again or check Auth0 audience/roles.'
      : 'An error occurred while fetching the data.');
    try {
      error.info = await response.json();
    } catch {
      try {
        const text = await response.text();
        error.info = { message: text };
      } catch {}
    }
    error.status = response.status;
    error.url = finalUrl;
    if (process.env.NODE_ENV === 'development') {
      console.warn('API request failed', {
        url: redactUrl(finalUrl),
        status: response.status,
        statusText: response.statusText,
        info: error.info,
      });
    }
    throw error;
  }
  try {
    return await response.json();
  } catch {
    // No JSON body (e.g., 204), return null
    return null;
  }
}

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    ['access_token', 'id_token', 'token', 'code'].forEach((key) => {
      if (parsed.searchParams.has(key)) parsed.searchParams.set(key, '[redacted]');
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

function isNotFoundError(error) {
  return Number(error?.status) === 404;
}

function isRecoverableOdontogramReadError(error) {
  const status = Number(error?.status);
  return status === 404 || status === 500;
}

function isAdvancedChart(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && value.version && value.teeth);
}

function stripSnapshotSidecars(chart) {
  if (!chart || typeof chart !== "object" || Array.isArray(chart)) return EMPTY_ADVANCED_ODONTOGRAM_CHART;
  const statusChart = { ...chart };
  delete statusChart._planChart;
  delete statusChart._plan_chart;
  delete statusChart._clinic;
  return statusChart;
}

function shouldUseLegacyPrimaryUniversal(teeth = []) {
  const numbers = (teeth || [])
    .map((tooth) => Number(tooth?.tooth_number ?? tooth?.toothNumber ?? tooth?.number))
    .filter(Number.isFinite);
  return numbers.length > 0 && numbers.every((number) => number >= 1 && number <= 20);
}

function chartsFromSnapshot(snapshot, teeth = []) {
  const payload = snapshot?.payload || snapshot || null;
  const primaryMode = shouldUseLegacyPrimaryUniversal(teeth);
  const fallbackStatus = buildAdvancedOdontogramPayload({ teeth, snapshot, primaryMode });
  const statusCandidate = payload?.statusChart || payload?.status_chart || payload?.chart || fallbackStatus;
  const planCandidate = payload?.planChart || payload?.plan_chart || payload?._planChart || payload?._plan_chart;

  return {
    statusChart: stripSnapshotSidecars(isAdvancedChart(statusCandidate) ? statusCandidate : fallbackStatus),
    planChart: isAdvancedChart(planCandidate) ? planCandidate : EMPTY_ADVANCED_ODONTOGRAM_CHART,
  };
}

function compatibilityStateFromCharts(patientId, charts, sourceVersion, reason) {
  return {
    patient_id: patientId,
    source_version: sourceVersion || "react-advanced-odontogram@2.2.0",
    host_api_version: "clinic-advanced-odontogram-host@compat",
    status_chart: charts.statusChart || EMPTY_ADVANCED_ODONTOGRAM_CHART,
    plan_chart: charts.planChart || EMPTY_ADVANCED_ODONTOGRAM_CHART,
    tooth_states: [],
    plan_items: [],
    row_version: null,
    compatibility_mode: "snapshot",
    compatibility_reason: reason,
  };
}

async function getCompatibilityOdontogramState(patientId, reason) {
  const [snapshot, teeth] = await Promise.all([
    fetcher(`/patients/${patientId}/odontogram-snapshot`).catch((error) => {
      if (isRecoverableOdontogramReadError(error)) return null;
      throw error;
    }),
    fetcher('/teeth', { params: { patientId } }).catch((error) => {
      if (isNotFoundError(error)) return [];
      throw error;
    }),
  ]);

  return compatibilityStateFromCharts(
    patientId,
    chartsFromSnapshot(snapshot, Array.isArray(teeth) ? teeth : []),
    snapshot?.source_version,
    reason
  );
}

async function getOdontogramState(patientId) {
  try {
    return await fetcher(`/patients/${patientId}/odontogram-state`);
  } catch (error) {
    if (!isRecoverableOdontogramReadError(error)) throw error;
    return getCompatibilityOdontogramState(patientId, `Full odontogram-state endpoint returned HTTP ${error.status}; using snapshot/teeth compatibility state.`);
  }
}

async function saveOdontogramState(patientId, data, rowVersion) {
  try {
    return await fetcher(`/patients/${patientId}/odontogram-state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(rowVersion ? { 'If-Match': rowVersion } : {}),
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (!isRecoverableOdontogramReadError(error)) throw error;
    const snapshot = await fetcher(`/patients/${patientId}/odontogram-snapshot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_version: data?.source_version || "react-advanced-odontogram@2.2.0",
        payload: {
          statusChart: data?.status_chart || EMPTY_ADVANCED_ODONTOGRAM_CHART,
          planChart: data?.plan_chart || EMPTY_ADVANCED_ODONTOGRAM_CHART,
          _clinic: {
            provider: "react-advanced-odontogram",
            sourceVersion: data?.source_version || "react-advanced-odontogram@2.2.0",
            hostApiVersion: data?.host_api_version || "clinic-advanced-odontogram-host@1",
            savedAt: data?.client_saved_at || new Date().toISOString(),
            compatibilityMode: "snapshot",
          },
        },
      }),
    });
    return compatibilityStateFromCharts(
      patientId,
      chartsFromSnapshot(snapshot, []),
      snapshot?.source_version || data?.source_version,
      `Full odontogram-state endpoint returned HTTP ${error.status}; saved through snapshot compatibility endpoint.`
    );
  }
}

export const api = {
  appointment: {
    getAll: (params) => fetcher('/appointment', { params }),
    getById: (id) => fetcher(`/appointment/${id}`),
    create: (data) => fetcher('/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/appointment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/appointment/${id}`, {
      method: 'DELETE',
    }),
  },
  toothSurfaces: {
    getHistory: (toothId) => fetcher(`/teeth/${toothId}/surfaces`),
  },
  billing: {
    getAll: (params) => fetcher('/billing', { params }),
    getById: (id) => fetcher(`/billing/${id}`),
    create: (data) => fetcher('/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/billing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/billing/${id}`, {
      method: 'DELETE',
    }),
    // Payments
    addPayment: (billingId, data) => fetcher(`/billing/${billingId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    getPayments: (billingId) => fetcher(`/billing/${billingId}/payments`),
    deletePayment: (billingId, paymentId) => fetcher(`/billing/${billingId}/payments/${paymentId}`, {
      method: 'DELETE',
    }),
    // Line items
    addLineItem: (billingId, data) => fetcher(`/billing/${billingId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    updateLineItem: (billingId, lineItemId, data) => fetcher(`/billing/${billingId}/line-items/${lineItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    deleteLineItem: (billingId, lineItemId) => fetcher(`/billing/${billingId}/line-items/${lineItemId}`, {
      method: 'DELETE',
    }),
    // Discounts / totals
    applyDiscount: (billingId, percentage) => fetcher(`/billing/${billingId}/apply-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(percentage),
    }),
    recalculate: (billingId) => fetcher(`/billing/${billingId}/recalculate`, {
      method: 'POST',
    }),
  },
  document: {
    getAll: (params) => fetcher('/document', { params }),
    getById: (id) => fetcher(`/document/${id}`),
    getDownloadUrl: (id) => fetcher(`/document/${id}/download-url`),
    upload: async (formData) => {
      const res = await authFetch(`${API_BASE_URL}/document/upload`, { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      return res.json();
    },
    create: (data) => fetcher('/document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/document/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/document/${id}`, {
      method: 'DELETE',
    }),
  },
  patient: {
    getAll: () => fetcher('/patient'),
    getById: (id) => fetcher(`/patient/${id}`),
    create: (data) => fetcher('/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/patient/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/patient/${id}`, {
      method: 'DELETE',
    }),
  },
  prescription: {
    getAll: () => fetcher('/prescription'),
    getById: (id) => fetcher(`/prescription/${id}`),
    create: (data) => fetcher('/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/prescription/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/prescription/${id}`, {
      method: 'DELETE',
    }),
  },
  role: {
    getAll: () => fetcher('/role'),
    getById: (id) => fetcher(`/role/${id}`),
    create: (data) => fetcher('/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/role/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/role/${id}`, {
      method: 'DELETE',
    }),
  },
  sale: {
    getAll: () => fetcher('/sale'),
    getById: (id) => fetcher(`/sale/${id}`),
    create: (data) => fetcher('/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/sale/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/sale/${id}`, {
      method: 'DELETE',
    }),
  },
  service: {
    getAll: () => fetcher('/service'),
    getById: (id) => fetcher(`/service/${id}`),
    create: (data) => fetcher('/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/service/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/service/${id}`, {
      method: 'DELETE',
    }),
  },
  specialty: {
    getAll: () => fetcher('/specialty'),
    getById: (id) => fetcher(`/specialty/${id}`),
    create: (data) => fetcher('/specialty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/specialty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/specialty/${id}`, {
      method: 'DELETE',
    }),
  },
  staff: {
    getAll: () => fetcher('/staff'),
    getById: (id) => fetcher(`/staff/${id}`),
    create: (data) => fetcher('/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/staff/${id}`, {
      method: 'DELETE',
    }),
  },
  teeth: {
    getAll: (params) => fetcher('/teeth', { params }),
    getById: (id) => fetcher(`/teeth/${id}`),
    create: (data) => fetcher('/teeth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id, data) => fetcher(`/teeth/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id) => fetcher(`/teeth/${id}`, {
      method: 'DELETE',
    }),
  },
  odontogram: {
    getSnapshot: (patientId) => fetcher(`/patients/${patientId}/odontogram-snapshot`),
    saveSnapshot: (patientId, data) => fetcher(`/patients/${patientId}/odontogram-snapshot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    getState: getOdontogramState,
    saveState: saveOdontogramState,
    commitPlan: (patientId, data) => fetcher(`/patients/${patientId}/odontogram-plan/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    dismissPlanItem: (patientId, planItemId) => fetcher(`/patients/${patientId}/odontogram-plan/${planItemId}/dismiss`, {
      method: 'POST',
    }),
  },
  treatments: {
      getAll: (params) => fetcher('/treatments', { params }),
      getById: (id) => fetcher(`/treatments/${id}`),
      create: (data) => fetcher('/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/treatments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/treatments/${id}`, {
        method: 'DELETE',
      }),
      complete: (id) => fetcher(`/treatments/${id}/complete`, {
        method: 'POST',
      }),
      cancel: (id) => fetcher(`/treatments/${id}/cancel`, {
        method: 'POST',
      }),
    },
  perio: {
    getLatest: (patientId) => fetcher('/perio/latest', { params: { patientId } }),
    create: (data) => fetcher('/perio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    statistics: (patientId) => fetcher('/perio/statistics', { params: { patientId } }),
  },
  // Notifications & Campaigns (use http client for snake/camel conversion)
  notifications: {
    topics: () => fetcher('/notifications/topics'),
    dispatch: (data) => http.post('/notifications/dispatch', data),
  },
  campaigns: {
    preview: (data) => http.post('/campaigns/preview', data),
    create: (data) => http.post('/campaigns', data),
    launch: (campaignId) => http.post(`/campaigns/${campaignId}/launch`, {}),
    getById: (campaignId) => http.get(`/campaigns/${campaignId}`),
    stats: (campaignId) => http.get(`/campaigns/${campaignId}/stats`),
    list: () => fetcher('/campaigns'),
  },
  lookup: {
    appointmentStatus: {
      getAll: () => fetcher('/lookup/appointment-status'),
      getById: (id) => fetcher(`/lookup/appointment-status/${id}`),
      create: (data) => fetcher('/lookup/appointment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/lookup/appointment-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/lookup/appointment-status/${id}`, {
        method: 'DELETE',
      }),
    },
    documentTypes: {
      getAll: () => fetcher('/lookup/document-types'),
      getById: (id) => fetcher(`/lookup/document-types/${id}`),
      create: (data) => fetcher('/lookup/document-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/lookup/document-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/lookup/document-types/${id}`, {
        method: 'DELETE',
      }),
    },
    discountTypes: {
      getAll: () => fetcher('/lookup/discount-types'),
      getById: (id) => fetcher(`/lookup/discount-types/${id}`),
      create: (data) => fetcher('/lookup/discount-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/lookup/discount-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/lookup/discount-types/${id}`, {
        method: 'DELETE',
      }),
    },
    roles: {
      getAll: () => fetcher('/lookup/roles'),
      getById: (id) => fetcher(`/lookup/roles/${id}`),
      create: (data) => fetcher('/lookup/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/lookup/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/lookup/roles/${id}`, {
        method: 'DELETE',
      }),
    },
    toothStatus: {
      getAll: () => fetcher('/lookup/tooth-status'),
      getById: (id) => fetcher(`/lookup/tooth-status/${id}`),
      create: (data) => fetcher('/lookup/tooth-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/lookup/tooth-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/lookup/tooth-status/${id}`, {
        method: 'DELETE',
      }),
    },
    specialties: {
      getAll: () => fetcher('/specialty'),
      getById: (id) => fetcher(`/specialty/${id}`),
      create: (data) => fetcher('/specialty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      update: (id, data) => fetcher(`/specialty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      delete: (id) => fetcher(`/specialty/${id}`, {
        method: 'DELETE',
      }),
    },
  }
};
