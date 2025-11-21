// app.js
// This file handles the Task and TimedTask classes.
// the class Task is for normal tasks, and the class TimedTask is for countdown.

// Main Task class
class Task {
  constructor(name, description, priority, deadline, id = crypto.randomUUID()) { // default id added - changed by Raymond
    this.id = id; // unique identifier added — changed by Raymond
    this.name = name; // name of the task
    this.description = description; // short description of the task
    this.priority = priority;
    this.deadline = deadline; // deadline date of the task
    this.completed = false; // it will start as not done
  }

  // this will mark the task as completed
  markAsDone() {
    this.completed = true;
  }

  // this will show task details 
  showDetails() {
    console.log(`Task: ${this.name}, Priority: ${this.priority}, Deadline: ${this.deadline}`);
  }
}

// Subclass for TimedTask
class TimedTask extends Task {
  constructor(name, description, priority, deadline, timeLeft, id) { // id param added - changed by Raymond
    super(name, description, priority, deadline, id); // pass id to base class - changed by Raymond
    this.timeLeft = timeLeft; // this will show how much time is remaining for the task
  }

  // Countdown method 
  startCountdown() {
    console.log(`Countdown started for task: ${this.name}`);
    // Later this will be connected with timers.js
  }
}

// Export the classes in other files
export { Task, TimedTask };



// NOV 20th Changes by Raymond after a review
// Added a unique id to Task and passed it through TimedTask to ensure reliable UI mapping and storage - changed by Raymond.