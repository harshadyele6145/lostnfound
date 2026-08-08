// Automatically pick up environment variable or default to backend URL
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://lostnfound-1-k7es.onrender.com/api').replace(/\/$/, '');

export const getApiUrl = () => BASE_URL;

export const submitClaim = async (itemId, proofDetails, token) => {
  const response = await fetch(`${BASE_URL}/items/${itemId}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ proofDetails }),
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response received:', text);
    throw new Error(`Server returned HTML instead of JSON (${response.status}). Check VITE_API_URL settings.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit claim');
  }

  return data;
};