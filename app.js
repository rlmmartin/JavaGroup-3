// app.js
// This file handles the Task and TimedTask classes.
// the class Task is for normal tasks, and the class TimedTask is for countdown.

// Main Task class
class Task {
  constructor(name, description, priority, deadline, id = crypto.randomUUID()) { 
    this.id = id; 
    this.name = name; 
    this.description = description; 
    this.priority = priority;
    this.deadline = deadline; 
    this.completed = false; 
    this.isUrgent = false;  
    this.timeLeft = 0;  
  }

  markAsDone() {
    this.completed = true;
  }

  showDetails() {
    console.log(`Task: ${this.name}, Priority: ${this.priority}, Deadline: ${this.deadline}`);
  }
}

// Subclass for TimedTask
class TimedTask extends Task {
  constructor(name, description, priority, deadline, timeLeft, id) { 
    super(name, description, priority, deadline, id);
    this.timeLeft = timeLeft; 
    this.isUrgent = false; 
  }

  startCountdown() {
    console.log(`Countdown started for task: ${this.name}`);
  }
}

// Export classes
export { Task, TimedTask };

import { getStreakData } from "./storage.js"; // Pietro added: import streak data

export function checkRewards() { // Pietro added: checks if user earns reward
    const streak = getStreakData(); 
    if (streak.streakCount === 7) {
        grantReward("Seven day streak badge"); // Pietro added: reward rule
    }
}

function grantReward(rewardName) { // Pietro added: stores earned badge in localStorage
    let rewards = JSON.parse(localStorage.getItem("rewardList")) || [];
    if (rewards.includes(rewardName)) return;
    rewards.push(rewardName);
    localStorage.setItem("rewardList", JSON.stringify(rewards));
}

// NOV 20th Changes by Raymond
// nov 26, changes by pietro. moved around some stuff and changed some lines for all work. idk if its good but do what u like lol