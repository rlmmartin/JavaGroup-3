// this function asks the browser for permission to show notifications
// basically, it checks if notifications are supported and then logs the result
export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
}

//  here we’re using JokeAPI instead of a quotes API
// this function grabs a random joke and shows it on the page
export async function fetchQuote() {
  // first, find the main content container
  const container = document.getElementById('main-content');
  if (!container) return;

  // check if we already have a quote-display element
  let display = document.getElementById('quote-display');
  if (!display) {
    // if not, make one and style it so it looks nice
    display = document.createElement('div');
    display.id = 'quote-display';
    display.style.margin = '12px auto';
    display.style.maxWidth = '600px';
    display.style.fontStyle = 'italic';
    // put it at the top of the container
    container.prepend(display);
  }

  try {
    // call the JokeAPI to get a random joke
    const res = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // JokeAPI can return either a single joke or a two-part joke
    if (data.type === 'single' && data.joke) {
      // single joke → just show the joke text
      display.textContent = `“${data.joke}”`;
    } else if (data.type === 'twopart' && data.setup && data.delivery) {
      // two-part joke → show setup and delivery together
      display.textContent = `“${data.setup} … ${data.delivery}”`;
    } else {
      // fallback if the data isn’t what we expect
      display.textContent = 'Keep smiling and stay focused!';
    }
  } catch (err) {
    // if the API call fails, log the error and show a fallback message
    console.warn('Joke fetch failed:', err);
    display.textContent = 'Keep smiling and stay focused!';
  }
}

// --- Summary for this file ---
// This timers.js module covers a bunch of our Week 1–2 requirements:
// - It uses JavaScript syntax and statements (if/else, async/await, try/catch).
// - It has modular functions like requestNotificationPermission and fetchQuote.
// - It’s separated into its own module, keeping the project organized and reusable.
// - It shows DOM manipulation by creating and styling the quote display element dynamically.
// - It demonstrates asynchronous programming with fetchQuote() calling an external API.
// - It integrates an API call (JokeAPI) to bring in real-time content.
// Altogether, this file proves we’re hitting the fundamentals: modular code, DOM updates,
// async programming, and API integration, which line up with our Week 1–2 tasks.

