const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

async function fetcher(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  appointment: {
    getAll: () => fetcher('/appointment'),
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
  billing: {
    getAll: () => fetcher('/billing'),
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
  },
  document: {
    getAll: () => fetcher('/document'),
    getById: (id) => fetcher(`/document/${id}`),
    upload: async (formData) => {
      const res = await fetch(`${API_BASE_URL}/document/upload`, { method: 'POST', body: formData });
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
    getAll: () => fetcher('/teeth'),
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
  treatments: {
    getAll: () => fetcher('/treatments'),
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
  }
};
