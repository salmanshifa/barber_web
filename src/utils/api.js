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

// ─── Staff API ──────────────────────────────

const POSITION_MAP = {
  'massage-therapist': 'MASSAGE_THERAPIST',
  esthetician: 'ESTHETICIAN',
  hairstylist: 'HAIRSTYLIST',
  'nail-technician': 'NAIL_TECHNICIAN',
  manager: 'MANAGER',
  receptionist: 'RECEPTIONIST',
  assistant: 'ASSISTANT',
  other: 'OTHER',
};

const REVERSE_POSITION_MAP = Object.fromEntries(
  Object.entries(POSITION_MAP).map(([k, v]) => [v, k])
);

const ROLE_ICONS = {
  'massage-therapist': '💆',
  esthetician: '✨',
  hairstylist: '💇',
  'nail-technician': '💅',
  manager: '👔',
  receptionist: '📞',
  assistant: '🤝',
};

const ROLE_LABELS = {
  'massage-therapist': 'Massage Therapist',
  esthetician: 'Esthetician',
  hairstylist: 'Hairstylist',
  'nail-technician': 'Nail Technician',
  manager: 'Manager',
  receptionist: 'Receptionist',
  assistant: 'Assistant',
};

/** Fetch all staff members from the backend */
export async function fetchStaff() {
  const response = await fetch(`${API_BASE_URL}/staff`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch staff (${response.status})`);
  }
  const json = await response.json();
  const list = Array.isArray(json) ? json : (json.data || json.content || []);
  return list.map(mapStaffFromApi);
}

/** Create a new staff member */
export async function createStaff(frontendStaff) {
  const body = mapStaffToApi(frontendStaff);
  const response = await fetch(`${API_BASE_URL}/staff`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create staff (${response.status})`);
  }
  const json = await response.json();
  return mapStaffFromApi(json.data || json);
}

/** Update an existing staff member */
export async function updateStaff(id, frontendStaff) {
  const body = mapStaffToApi(frontendStaff);
  const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update staff (${response.status})`);
  }
  const json = await response.json();
  return mapStaffFromApi(json.data || json);
}

/** Delete a staff member */
export async function deleteStaff(id) {
  const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete staff (${response.status})`);
  }
  return true;
}

/** Fetch staff appointments (used on the staff dashboard) */
export async function fetchStaffAppointments(staffId) {
  const response = await fetch(`${API_BASE_URL}/appointments/staff/${staffId}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch staff appointments (${response.status})`);
  }
  const json = await response.json();
  const list = Array.isArray(json) ? json : (json.data || json.content || []);
  return list;
}

// ─── Staff mappers ────────────────────────────

/** Frontend → Backend */
function mapStaffToApi(frontend) {
  // Split full name into first/last
  const nameParts = (frontend.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Map position
  const position = POSITION_MAP[frontend.roleValue] || POSITION_MAP[frontend.role] || 'OTHER';

  return {
    username: frontend.username || '',
    email: frontend.email || '',
    mobileNumber: frontend.phone || '',
    position,
    enabled: true,
    password: frontend.password || '',
    firstName,
    lastName,
    employmentStatus: 'ACTIVE',
  };
}

/** Backend → Frontend */
function mapStaffFromApi(backend) {
  const roleValue = REVERSE_POSITION_MAP[backend.position] || 'other';
  const fullName = [backend.firstName, backend.lastName].filter(Boolean).join(' ');

  return {
    id: backend.id,
    name: fullName,
    role: ROLE_LABELS[roleValue] || backend.position || 'Other',
    roleValue,
    email: backend.email || '',
    phone: backend.phone || '',
    specialty: backend.specialty || '',
    avatar: '👩', // Default — user can change in the UI
    image: '',
    rating: backend.rating || 0,
    clients: backend.clients || 0,
  };
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
