const API_BASE = import.meta.env.VITE_API_URL || '';

type StartPayload = {
  name: string;
  roll_number: string;
  email?: string;
  college?: string;
  competition_id: string;
};

export async function startStudent(payload: StartPayload) {
  const res = await fetch(`${API_BASE}/api/students/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to start student');
    }
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }
  
  return (await res.json()).data;
}

export async function updateStudent(id: string, payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/students/${encodeURIComponent(id)}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to update student');
    }
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()).data;
}

export async function fetchStudents(competition_id?: string) {
  const qs = competition_id ? `?competition_id=${encodeURIComponent(competition_id)}` : '';
  const res = await fetch(`${API_BASE}/api/students${qs}`);

  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to fetch students');
    }
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data || [];
}

export default { startStudent, updateStudent, fetchStudents };
