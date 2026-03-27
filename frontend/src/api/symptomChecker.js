export async function analyzeSymptoms(payload) {
  const res = await fetch('http://localhost:8000/api/symptom-checker/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

// NEW: Fetch history for a user
export async function getSymptomHistory(userId) {
  // If you don't have this endpoint yet, this will safely return an empty array
  try {
    const res = await fetch(`http://localhost:8000/api/symptom-checker/history/${userId}`);
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.warn("History endpoint not ready yet.", err);
    return []; 
  }
}