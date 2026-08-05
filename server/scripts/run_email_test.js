// Script: run_email_test.js
// Purpose: create a claimant, submit a claim on a demo item, approve it as owner
// This triggers the mailer paths for claim notifications.
import('dotenv/config');
(async function run() {
  try {
    const fetch = (await import('node-fetch')).default;
    const base = 'http://localhost:5000/api';

    console.log('Fetching items...');
    let res = await fetch(`${base}/items`);
    const items = await res.json();
    if (!items || !items.length) throw new Error('No items available');
    const item = items[0];
    console.log('Using item:', item.id, item.title);

    // Register claimant (may already exist)
    const claimantEmail = 'claimant.test@example.edu';
    const claimantPassword = 'Testpass1!';
    res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Claimant Tester', email: claimantEmail, password: claimantPassword }),
    });
    if (res.status === 201) console.log('Claimant registered'); else console.log('Register status', res.status);

    // Login claimant
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: claimantEmail, password: claimantPassword }),
    });
    const claimantAuth = await res.json();
    if (!claimantAuth?.token) throw new Error('Failed to log in claimant');
    const claimantToken = claimantAuth.token;
    console.log('Claimant logged in');

    // Submit claim
    res = await fetch(`${base}/items/${item.id}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${claimantToken}` },
      body: JSON.stringify({ message: 'I believe this is my backpack lost at the library.' }),
    });
    const claimResult = await res.json();
    console.log('Claim submit:', res.status, claimResult.id || claimResult.message || JSON.stringify(claimResult));

    // Login owner (demo)
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@campusfind.edu', password: 'Demo123!' }),
    });
    const ownerAuth = await res.json();
    if (!ownerAuth?.token) throw new Error('Failed to log in owner');
    const ownerToken = ownerAuth.token;
    console.log('Owner logged in');

    // Owner fetch claims
    res = await fetch(`${base}/items/mine/claims`, { headers: { Authorization: `Bearer ${ownerToken}` } });
    const ownerClaims = await res.json();
    const claim = ownerClaims.find((c) => c.item && c.item.id === item.id);
    if (!claim) throw new Error('Claim not found in owner claims');
    console.log('Approving claim id', claim.id);

    // Approve claim
    res = await fetch(`${base}/items/claims/${claim.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'approved' }),
    });
    const approveResp = await res.json();
    console.log('Approve response', res.status, approveResp);

    console.log('Email test flow completed — check SMTP inbox or Mailtrap.');
  } catch (err) {
    console.error('Error during email test:', err);
    process.exitCode = 1;
  }
})();
