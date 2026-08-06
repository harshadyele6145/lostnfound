const API = 'http://localhost:5000/api';

async function postJson(url, body, token) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function getJson(url, token) {
  const res = await fetch(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function main() {
  console.log('Logging in demo owner...');
  const ownerLogin = await postJson(`${API}/auth/login`, { email: 'demo@campusfind.edu', password: 'Demo123!' });
  if (ownerLogin.status !== 200) return console.error('Owner login failed', ownerLogin);
  const ownerToken = ownerLogin.data.token;
  console.log('Owner token:', !!ownerToken);

  console.log('Registering claimant user...');
  const reg = await postJson(`${API}/auth/register`, { name: 'Claimant User', email: 'claimer@campusfind.edu', password: 'Claimer123!' });
  let claimantToken = null;
  if (reg.status === 201) claimantToken = reg.data.token;
  else {
    console.log('Register returned', reg.status, reg.data?.message || 'trying login');
    const login = await postJson(`${API}/auth/login`, { email: 'claimer@campusfind.edu', password: 'Claimer123!' });
    if (login.status !== 200) return console.error('Claimant registration/login failed', login);
    claimantToken = login.data.token;
  }
  console.log('Claimant token:', !!claimantToken);

  console.log('Listing items...');
  const itemsRes = await getJson(`${API}/items`);
  if (!itemsRes.data || !itemsRes.data.length) return console.error('No items to test with');
  const item = itemsRes.data[0];
  console.log('Using item:', item.id, item.title);

  console.log('Claimant submits a claim...');
  const claimRes = await postJson(`${API}/items/${item.id}/claims`, { message: 'I believe this is mine. I last left it near the counter.' }, claimantToken);
  console.log('Claim result:', claimRes.status, claimRes.data);

  console.log('Owner generates QR token...');
  const qrRes = await getJson(`${API}/items/${item.id}/qr-token`, ownerToken);
  console.log('QR token response:', qrRes.status, qrRes.data);
  const token = qrRes.data?.token;
  if (!token) return console.error('No token generated');

  console.log('Claimant verifies QR token...');
  const verifyRes = await postJson(`${API}/items/verify-qr`, { token }, claimantToken);
  console.log('Verify response:', verifyRes.status, verifyRes.data);

  console.log('Fetching updated item...');
  const updated = await getJson(`${API}/items/${item.id}`);
  console.log('Item status:', updated.data?.status);

  console.log('Fetching claimant claims...');
  const claims = await getJson(`${API}/items/claims/mine`, claimantToken);
  console.log('Claims for claimant:', claims.data);
}

main().catch((e) => { console.error(e); process.exit(1); });
