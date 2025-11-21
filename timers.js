// timers.js
// Exports: requestNotificationPermission, fetchQuote
// Robust client-side implementations with graceful fallbacks
// Added by Raymond: defensive fetch, fallback quote, and non-blocking notification request

export async function requestNotificationPermission() {
  // Request notification permission safely - added by Raymond
  if (!('Notification' in window)) return 'unsupported';
  try {
    const current = Notification.permission;
    if (current === 'granted') return 'granted';
    if (current === 'denied') return 'denied';
    const result = await Notification.requestPermission();
    return result; // 'granted' | 'denied' | 'default'
  } catch (err) {
    console.warn('Notification permission request failed', err); // debug - added by Raymond
    return 'error';
  }
}

export async function fetchQuote() {
  // Primary public API (may be blocked by CORS) - added by Raymond
  const primary = 'https://zenquotes.io/api/random';
  // Optional development CORS proxy (uncomment if you run the local proxy below) - added by Raymond
  

  // Fallback local quote — added by Raymond
  const fallback = [{ q: "Keep going, keep pushing! (fallback quote since api doesnt work yet.)", a: "Dan" }];

  try {
    // Attempt primary fetch first — added by Raymond
    const res = await fetch(primary);
    if (!res.ok) throw new Error('non-OK response: ' + res.status);
    const json = await res.json();
    applyQuote(json);
    return json;
  } catch (errPrimary) {
    console.warn('Fetch error from primary quote API, trying proxy if available', errPrimary); // added by Raymond

    // Final fallback - added by Raymond
    applyQuote(fallback);
    return fallback;
  }
}

function applyQuote(data) {
  // Defensive: data might be an array [{ q, a }] or an object -added by Raymond
  try {
    const q = Array.isArray(data) ? data[0] : data;
    const text = q.q || q.quote || 'Keep going — fallback quote.';
    const author = q.a || q.author || 'Unknown';
    // Find or create an element to display the quote - added by Raymond
    let el = document.getElementById('quote-display');
    if (!el) {
      el = document.createElement('div');
      el.id = 'quote-display';
      el.style.fontStyle = 'italic';
      el.style.margin = '12px 0';
      const main = document.querySelector('#main-content') || document.body;
      main.prepend(el);
    }
    el.textContent = `"${text}" — ${author}`;
  } catch (e) {
    console.warn('applyQuote failed', e); // debug -added by Raymond
  }
}