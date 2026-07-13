export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Get the stored auth token */
export function getAuthToken() {
  try {
    return localStorage.getItem('serenity-token');
  } catch {
    return null;
  }
}

/** Build headers with optional auth token */
export function authHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Category mapping ───────────────────────

const CATEGORY_MAP = {
  massage: 'MASSAGE',
  facial: 'FACIAL',
  stone: 'HOT_STONE',
  hair: 'HAIR',
  nails: 'NAILS',
  aroma: 'AROMATHERAPY',
  body: 'BODY_TREATMENT',
  other: 'OTHER',
};

const REVERSE_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

const CATEGORY_ICONS = {
  massage: '💆',
  facial: '✨',
  stone: '🪨',
  hair: '💇',
  nails: '💅',
  aroma: '🌿',
  body: '🧴',
  other: '🌟',
};

// ─── Services API ───────────────────────────

/** Fetch all services from the backend */
export async function fetchServices() {
  const response = await fetch(`${API_BASE_URL}/services/owner`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch services (${response.status})`);
  }
  const json = await response.json();
  // Backend may return { data: [...] } or array directly
  const list = Array.isArray(json) ? json : (json.data || json.content || []);
  return list.map(mapServiceFromApi);
}

/** Create a new service */
export async function createService(frontendService) {
  const body = mapServiceToApi(frontendService);
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create service (${response.status})`);
  }
  const json = await response.json();
  return mapServiceFromApi(json.data || json);
}

/** Update an existing service */
export async function updateService(id, frontendService) {
  const body = mapServiceToApi(frontendService);
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update service (${response.status})`);
  }
  const json = await response.json();
  return mapServiceFromApi(json.data || json);
}

/** Delete a service */
export async function deleteService(id) {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete service (${response.status})`);
  }
  return true;
}

// ─── Data mappers ───────────────────────────

/** Frontend → Backend */
function mapServiceToApi(frontend) {
  const category = CATEGORY_MAP[frontend.category] || 'OTHER';
  return {
    name: frontend.title,
    description: frontend.description || '',
    category,
    price: frontend.price.replace('$', ''),
    durationMinutes: parseInt(frontend.time, 10) || 60,
    status: 'ACTIVE',
  };
}

/** Backend → Frontend */
function mapServiceFromApi(backend) {
  const category = REVERSE_CATEGORY_MAP[backend.category] || 'other';
  return {
    id: backend.id,
    title: backend.name,
    description: backend.description || '',
    category,
    icon: CATEGORY_ICONS[category] || '🌟',
    price: backend.price ? `$${parseFloat(backend.price).toFixed(0)}` : '$0',
    time: backend.durationMinutes ? `${backend.durationMinutes} min` : '—',
    status: backend.status || 'ACTIVE',
  };
}
