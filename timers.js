export async function requestNotificationPermission() { // Pietro note: used for notification setup
  if (!('Notification' in window)) return 'unsupported';
  try {
    const current = Notification.permission;
    if (current === 'granted') return 'granted';
    if (current === 'denied') return 'denied';
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'error';
  }
}

export async function fetchQuote() { // Pietro note: this is the active quote provider
  const primary = 'https://zenquotes.io/api/random';
  const fallback = [{ q: "Keep going, keep pushing! (fallback quote)", a: "Dan" }];

  try {
    const res = await fetch(primary);
    if (!res.ok) throw new Error();
    const json = await res.json();
    applyQuote(json);
    return json;
  } catch {
    applyQuote(fallback);
    return fallback;
  }
}

function applyQuote(data) { // Pietro added: visualizes quote in UI
  try {
    const q = Array.isArray(data) ? data[0] : data;
    const text = q.q || q.quote || 'Keep going.';
    const author = q.a || q.author || 'Unknown';
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
  } catch {}
}
