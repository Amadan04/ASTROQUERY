export const api = (p) => `${window.__API_BASE__ || 'http://localhost:5000'}${p}`;

export async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function getSchema() {
  return fetchJSON(api('/sim/schema'));
}

export async function searchEvidence(q, k = 8, filters = {}) {
  return fetchJSON(api('/sim/search'), {
    method: 'POST',
    body: JSON.stringify({ q, k, filters }),
  });
}

export async function runPrediction(scenario) {
  return fetchJSON(api('/sim/run'), {
    method: 'POST',
    body: JSON.stringify(scenario),
  });
}

export async function getCurve(scenario, max_days = 120, step = 10) {
  return fetchJSON(api('/sim/curve'), {
    method: 'POST',
    body: JSON.stringify({ scenario, max_days, step }),
  });
}

export async function compareScenarios(baseline, variant) {
  return fetchJSON(api('/sim/compare'), {
    method: 'POST',
    body: JSON.stringify({ baseline, variant }),
  });
}
