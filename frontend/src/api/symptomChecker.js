export async function analyzeSymptoms(payload) {
  const res = await fetch('http://localhost:8000/api/symptom-checker/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), // Passes whatever the component sends
  });

  if (!res.ok) {
    let errorMessage = 'Failed to analyze symptoms';
    try {
      const err = await res.json();
      errorMessage = err.detail?.[0]?.msg || JSON.stringify(err);
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export default { analyzeSymptoms };