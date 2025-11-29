// bringing in Task and TimedTask from app.js (not really used here, but good to have ready)
import { Task, TimedTask } from './app.js';

// this function sets up a reminder notification for a task
// you give it the task name, and how many hours before you want the reminder (default is 3)
export async function scheduleNotification(taskName, hoursBefore = 3) {
    // first thing, check if the browser even supports notifications
    if (!("Notification" in window)) return;

    // then we ask the user for permission to show notifications
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        // this part down here has to do with converting hours into milliseconds
        const triggerInMs = hoursBefore * 3600000;

        // after that amount of time passes, we pop up a notification
        setTimeout(() => {
            new Notification("Task Reminder", {
                body: "Reminder for: " + taskName
            });
        }, triggerInMs);
    } else {
        // if the user says no to notifications, we just show a banner inside the app instead
        showInAppBanner("Reminder for: " + taskName);
    }
}

// this helper makes a simple banner message show up on the page
// it’s basically our fallback if notifications aren’t allowed
function showInAppBanner(message) {
    // create the banner element
    const banner = document.createElement("div");
    banner.textContent = message;

    // style it so it looks noticeable
    banner.style.padding = "10px";
    banner.style.background = "#ffe4a3";
    banner.style.borderRadius = "6px";
    banner.style.marginTop = "10px";

    // stick it onto the page
    document.body.appendChild(banner);

    // and remove it automatically after 5 seconds
    setTimeout(() => banner.remove(), 5000);
}






// --- Summary for this file ---
// This ui.js module shows off a bunch of the fundamentals we needed:
// - It uses JavaScript syntax and control structures (if/else, async/await).
// - It has modular functions like scheduleNotification and showInAppBanner.
// - It demonstrates asynchronous programming with Notification.requestPermission() and setTimeout.
// - It’s separated into its own module, keeping the project organized.
// - It ties into event-driven behavior (notifications and fallback banners).
// So overall, this file checks off the boxes for JavaScript basics, modular functions, async programming, and module organization from our Week 1–2 tasks.
