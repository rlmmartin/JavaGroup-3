import { Task, TimedTask } from './app.js';

export async function scheduleNotification(taskName, hoursBefore = 3) { // Pietro added: reminder scheduling
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        const triggerInMs = hoursBefore * 3600000;

        setTimeout(() => {
            new Notification("Task Reminder", {
                body: "Reminder for: " + taskName
            });
        }, triggerInMs);
    } else {
        showInAppBanner("Reminder for: " + taskName); // Pietro added: fallback UI banner
    }
}

function showInAppBanner(message) { // Pietro added: fallback banner for denied permissions
    const banner = document.createElement("div");
    banner.textContent = message;
    banner.style.padding = "10px";
    banner.style.background = "#ffe4a3";
    banner.style.borderRadius = "6px";
    banner.style.marginTop = "10px";
    document.body.appendChild(banner);

    setTimeout(() => banner.remove(), 5000);
}
