// Request notification permission (starter requirement)
function requestNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(result => {
      console.log("Notification permission status:", result);
    });
  } else {
    console.log("Notification permission already granted.");
  }
}

requestNotificationPermission(); // run on load



// Fetch motivational quotes (console only for now)
async function fetchQuote() {
  try {
    const res = await fetch("https://zenquotes.io/api/random");
    const data = await res.json();
    console.log("Motivational Quote:", data[0].q, "—", data[0].a);
  } catch (err) {
    console.error("Error fetching quote:", err);
  }
}

fetchQuote(); // fetch once on load



// Export starter functions
export { requestNotificationPermission, fetchQuote };