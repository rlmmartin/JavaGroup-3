// This file handles the Task and TimedTask classes.
// the class Task is for normal tasks, and the class TimedTask is for countdown.

// Main Task class
class Task {
  constructor(name, description, priority, deadline, id = crypto.randomUUID()) { 
    // set up all the basic properties for a task
    this.id = id; 
    this.name = name; 
    this.description = description; 
    this.priority = priority;
    this.deadline = deadline; 
    this.completed = false;  // starts off not completed
    this.isUrgent = false;   // flag for urgent tasks
    this.timeLeft = 0;       // countdown placeholder
  }

  // mark the task as done
  markAsDone() {
    this.completed = true;
  }

  // show task details in the console (for debugging or info)
  showDetails() {
    console.log(`Task: ${this.name}, Priority: ${this.priority}, Deadline: ${this.deadline}`);
  }
}

// Subclass for TimedTask
class TimedTask extends Task {
  constructor(name, description, priority, deadline, timeLeft, id) { 
    // call the parent Task constructor
    super(name, description, priority, deadline, id);
    // timed tasks also track timeLeft
    this.timeLeft = timeLeft; 
    this.isUrgent = false; 
  }

  // start the countdown (right now just logs to console)
  startCountdown() {
    console.log(`Countdown started for task: ${this.name}`);
  }
}

// Export classes so other files can use them
export { Task, TimedTask };

import { getStreakData } from "./storage.js"; // bringing in streak data from storage

// this function checks if the user earns a reward based on streaks
export function checkRewards() { 
    const streak = getStreakData(); 
    // if the streak count hits 7, give a badge
    if (streak.streakCount === 7) {
        grantReward("Seven day streak badge"); 
    }
}

// helper to store earned rewards in localStorage
function grantReward(rewardName) { 
    let rewards = JSON.parse(localStorage.getItem("rewardList")) || [];
    // don’t add duplicates
    if (rewards.includes(rewardName)) return;
    rewards.push(rewardName);
    localStorage.setItem("rewardList", JSON.stringify(rewards));
}

// NOV 20th Changes by Raymond
// nov 26, changes by p. moved around some stuff and changed some lines for all work. idk if its good but do what u like lol





// --- Summary for this file ---
// This app.js module hits several Week 1–2 requirements:
// - It uses JavaScript syntax and statements (constructors, if/else, console.log).
// - It defines classes (Task and TimedTask) and shows inheritance with TimedTask extending Task.
// - It has modular functions like markAsDone, showDetails, startCountdown, checkRewards, and grantReward.
// - It’s separated into its own module, keeping the project organized and reusable.
// - It uses localStorage with JSON to store rewards, showing data handling.
// Altogether, this file demonstrates class usage, inheritance, modular functions,
// and JSON handling, which line up with our Week 1–2 tasks.
