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

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to start student');
  return json.data;
}

export async function updateStudent(id: string, payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/students/${encodeURIComponent(id)}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update student');
  return json.data;
}

export async function fetchStudents(competition_id?: string) {
  const qs = competition_id ? `?competition_id=${encodeURIComponent(competition_id)}` : '';
  const res = await fetch(`${API_BASE}/api/students${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch students');
  return json.data || [];
}

export default { startStudent, updateStudent, fetchStudents };
