export async function analyzeSymptoms({ user_id, description }) {
  const res = await fetch('http://localhost:8000/api/symptom-checker/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, description }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to analyze symptoms');
  }

  return res.json();
}

export default { analyzeSymptoms };
