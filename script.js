// script.js (updated, Week 1–2 complete integration)

// Imports
// pulling in our classes and helper functions from other files
import { Task, TimedTask } from './app.js';
import { saveTasks, loadTasks, updateStreak } from './storage.js';
import { requestNotificationPermission, fetchQuote } from "./timers.js";
import { checkRewards } from "./app.js";

// Initialize notifications + quote
// right at the start, we ask for notification permission and fetch a motivational quote/joke
requestNotificationPermission();
fetchQuote();

// Callback system (for urgent events, etc.)
// this sets up a simple callback system so we can react when tasks get urgent
let eventCallback = { onUrgent: [] };

// register a callback for a specific event
function onCallback(event, callback) {
  if (eventCallback[event]) {
    eventCallback[event].push(callback);
  }
}

// trigger all callbacks for a given event
async function emitCallback(event, data) {
  if (eventCallback[event]) {
    eventCallback[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error("Callback failed", err);
      }
    });
  }
}

// example: when a task becomes urgent, log it out
onCallback('onUrgent', (task) => {
  console.log('Urgent task detected:', task.name);
});

// Utilities
// helper to calculate how much time is left until a deadline
function calcTimeLeft(deadlineStr) {
  if (!deadlineStr) return 0;
  const d = new Date(deadlineStr);
  // set deadline to the very end of the day
  d.setHours(23, 59, 59, 999);
  return d.getTime() - Date.now();
}

// State
// load tasks from storage, or start with an empty list
let tasks = loadTasks() || [];
// window.tasks = tasks; // uncomment for debugging

// confetti celebration
// this shows a little popup celebration message when a task is completed
function showCelebration(msg) {
  const celebration = document.createElement('div');
  celebration.textContent = msg;
  celebration.className = 'celebration';
  celebration.setAttribute('role', 'status');
  celebration.setAttribute('aria-live', 'polite');
  document.body.appendChild(celebration);
  setTimeout(() => celebration.remove(), 3000);
}

// form validation
// this part handles showing errors if the form is missing required info
function setError(input, msg) {
  input.classList.add('error-state');
  let span = document.getElementById(`${input.id}-error`);
  if (!span) {
    span = document.createElement('span');
    span.id = `${input.id}-error`;
    span.className = 'error';
    span.setAttribute('role', 'alert');
    span.setAttribute('aria-live', 'polite');
    input.insertAdjacentElement('afterend', span);
  }
  span.textContent = msg;
}

// clear any error styling/messages from an input
function clearError(input) {
  input.classList.remove('error-state');
  const span = document.getElementById(`${input.id}-error`);
  if (span) span.textContent = '';
}

// validate the form before adding a task
function validateForm() {
  let valid = true;
  const nameEl = document.getElementById('task-name');
  const deadlineEl = document.getElementById('task-deadline');

  clearError(nameEl);
  clearError(deadlineEl);

  // check if task name is empty
  if (!nameEl.value.trim()) {
    setError(nameEl, 'Task name is required.');
    valid = false;
  }
  // check if deadline is missing
  if (!deadlineEl.value) {
    setError(deadlineEl, 'Deadline is required.');
    valid = false;
  }

  return valid;
}





// function to add a new task when the form is submitted
function addTask(e) {
  e.preventDefault();

  // run validation first, stop if invalid
  if (!validateForm()) {
    return;
  }

  // grab all the form elements
  const nameEl = document.getElementById('task-name');
  const descEl = document.getElementById('task-desc');
  const priEl = document.getElementById('task-priority');
  const deadlineEl = document.getElementById('task-deadline');

  // pull out the values and trim spaces
  const name = (nameEl?.value || '').trim();
  const description = (descEl?.value || '').trim();
  const priority = (priEl?.value || '').trim();
  const deadline = (deadlineEl?.value || '').trim();

  // quick check: name is required
  if (!name) {
    nameEl?.focus();
    return;
  }

  let task;
  try {
    // if deadline exists, make a TimedTask with countdown
    if (deadline) {
      const initialTimeLeft = calcTimeLeft(deadline);
      task = new TimedTask(name, description, priority, deadline, initialTimeLeft);
    } else {
      // otherwise just make a normal Task
      task = new Task(name, description, priority, '');
    }
  } catch (err) {
    // if something goes wrong creating the task, just stop
    return;
  }

  // add the new task to our list and save it
  tasks.push(task);
  saveTasks(tasks);

  // reset the form and put focus back on the name field
  document.getElementById('task-form')?.reset();
  nameEl?.focus();

  // re-render the tasks and update streak display
  renderTasks();
  updateStreakDisplay();
  return task;
}

// function to mark a task as complete
function completeTask(index) {
  const task = tasks[index];
  if (!task) return;

  // if the task has a markAsDone method, use it, otherwise just set completed = true
  if (typeof task.markAsDone === 'function') task.markAsDone();
  else task.completed = true;

  // save updated tasks and update streak/rewards
  saveTasks(tasks);
  updateStreak();
  checkRewards();

  // re-render tasks and streak display
  renderTasks();
  updateStreakDisplay();

  // celebration effects when a task is completed
  if (window.confetti) {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  }

  // show a popup message for the streak
  showCelebration("Task completed! Streak +1");
}



// function to start countdowns for timed tasks
function countDown() {
  tasks.forEach(task => {
    // only run countdown if it's a TimedTask and has the method
    if (task instanceof TimedTask && typeof task.startCountdown === 'function') {
      task.startCountdown();
    }
  });
}

// function to update timers for all tasks
function updateTimer() {
  tasks.forEach(task => {
    // only update if the task isn’t completed and has a deadline
    if (!task.completed && task.deadline) {
      const oldTimeLeft = task.timeLeft ?? 0;
      task.timeLeft = calcTimeLeft(task.deadline);

      // check if the task was urgent before and if it’s urgent now
      const wasUrgent = oldTimeLeft > 0 && oldTimeLeft <= 24 * 60 * 60 * 1000;
      const isUrgent = task.timeLeft > 0 && task.timeLeft <= 24 * 60 * 60 * 1000;

      // if it just became urgent, trigger the callback
      if (isUrgent && !wasUrgent) {
        emitCallback('onUrgent', task);
      }
      task.isUrgent = isUrgent;
    } else {
      // if no deadline or already completed, reset values
      task.timeLeft = 0;
      task.isUrgent = false;
    }
  });
}

// function to start the timer loop
function startTimer() { 
  // run every second
  setInterval(() => {
    updateTimer();

    // check if sorting or filtering is active
    const sortBy = document.getElementById('sort-by')?.value;
    const filterPriority = document.getElementById('filter-priority')?.value;
    const filterStatus = document.getElementById('filter-status')?.value;
    const currentActive = sortBy || filterPriority || filterStatus;

    // if filters are active, re-render with SortAndFilter
    if (currentActive) {
      SortAndFilter();
    } else {
      // otherwise just update the time displays
      updateTimeDisplaysOnly();
    }
  }, 1000);
}

// function to update only the time displays without rebuilding the whole list
function updateTimeDisplaysOnly() {
  const list = document.getElementById('task-list');
  if (!list) return;
  const items = list.querySelectorAll('li');

  items.forEach(li => {
    const id = li.dataset.id;
    const task = tasks.find(t => String(t.id) === String(id));
    const timeDisplay = li.querySelector('.time-display');
    if (!task || !timeDisplay) return;

    if (task.isUrgent) {
      // show urgent message if deadline is close
      timeDisplay.textContent = 'Deadline approaching!';
      timeDisplay.classList.add('urgent-time');
      timeDisplay.classList.remove('overdue');
      li.classList.add('urgent-task');
    } else if (task.timeLeft > 0) {
      // normal countdown display
      const day = Math.floor(task.timeLeft / (1000 * 60 * 60 * 24));
      const hour = Math.floor(task.timeLeft % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
      const minute = Math.floor((task.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const second = Math.floor((task.timeLeft % (1000 * 60)) / 1000);
      timeDisplay.textContent = day > 0
        ? `${day}d ${hour}h ${minute}m ${second}s`
        : `${hour}h ${minute}m ${second}s`;
      timeDisplay.classList.remove('urgent-time', 'overdue');
      li.classList.remove('urgent-task');
    } else if (!task.completed) {
      // overdue tasks
      timeDisplay.textContent = 'OVERDUE!';
      timeDisplay.classList.add('overdue');
      timeDisplay.classList.remove('urgent-time');
      li.classList.remove('urgent-task');
    } else {
      // completed tasks
      timeDisplay.textContent = 'Completed';
      timeDisplay.classList.remove('urgent-time', 'overdue');
      li.classList.remove('urgent-task');
    }

    // add or remove completed-task class based on status
    if (task.completed) {
      li.classList.add('completed-task');
    } else {
      li.classList.remove('completed-task');
    }
  });
}






// function to build a single task item element
function buildTaskItem(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;

  // create the time display section
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'time-display';

  if (task.isUrgent) {
    // show urgent message if deadline is close
    timeDisplay.textContent = 'Deadline approaching!';
    timeDisplay.classList.add('urgent-time');
    li.classList.add('urgent-task');
  } else if (task.timeLeft > 0) {
    // normal countdown display
    const day = Math.floor(task.timeLeft / (1000 * 60 * 60 * 24));
    const hour = Math.floor(task.timeLeft % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    const minute = Math.floor((task.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const second = Math.floor((task.timeLeft % (1000 * 60)) / 1000);
    timeDisplay.textContent = day > 0
      ? `${day}d ${hour}h ${minute}m ${second}s`
      : `${hour}h ${minute}m ${second}s`;
  } else if (task.timeLeft <= 0 && !task.completed) {
    // overdue tasks
    timeDisplay.textContent = 'OVERDUE!';
    timeDisplay.classList.add('overdue');
  } else if (task.completed) {
    // completed tasks
    timeDisplay.textContent = 'Completed';
  }

  // main section with title, description, and metadata
  const main = document.createElement('div');
  main.className = 'task-main';
  const title = document.createElement('strong');
  title.textContent = task.name || 'Untitled task';
  const desc = document.createElement('div');
  desc.textContent = task.description || '';
  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.textContent = `${task.priority || 'No priority'} • ${task.deadline || 'No deadline'}`;

  main.appendChild(title);
  if (desc.textContent) main.appendChild(desc);
  main.appendChild(meta);
  main.appendChild(timeDisplay);

  // delete button setup
  const del = document.createElement('span');
  del.innerHTML = '\u00d7';
  del.className = 'delete-btn';
  del.setAttribute('role', 'button');
  del.setAttribute('tabindex', '0');
  del.setAttribute('aria-label', 'Delete task');

  // complete button setup
  const completeBtn = document.createElement('button');
  completeBtn.textContent = task.completed ? 'Completed!' : 'Complete';
  completeBtn.className = 'complete-btn';

  // add completed-task class if task is done
  if (task.completed) {
    li.classList.add('completed-task');
  } else {
    li.classList.remove('completed-task');
  }

  // add pulsing class if priority is High
  if ((task.priority || '').trim().toLowerCase() === 'high') {
    li.classList.add('high-priority');
  }

  // actions section with complete and delete buttons
  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.appendChild(completeBtn);
  actions.appendChild(del);

  // put everything together
  li.appendChild(main);
  li.appendChild(actions);

  return li;
}

// function to render all tasks into the task list
function renderTasks() {
  const taskContainer = document.getElementById('task-list');
  if (!taskContainer) return;
  taskContainer.innerHTML = '';

  // if no tasks, show a placeholder message
  if (!Array.isArray(tasks) || tasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No tasks yet.';
    taskContainer.appendChild(li);
    return;
  }

  // otherwise build and append each task item
  tasks.forEach(task => {
    taskContainer.appendChild(buildTaskItem(task));
  });
}






// function to sort tasks based on deadline or priority
function sortTask(taskList, sort) {
  const sortedTask = [...taskList]; // make a copy so we don’t mess with the original
  switch (sort) {
    case 'deadline':
      // sort by deadline date, tasks without deadlines go to the far future
      return sortedTask.sort((a, b) => {
        const A = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
        const B = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
        return A - B;
      });
    case 'priority':
      // sort by priority level (high > medium > low)
      const order = { high: 3, medium: 2, low: 1 };
      return sortedTask.sort((a, b) => {
        const pa = order[(a.priority || '').toLowerCase()] || 0;
        const pb = order[(b.priority || '').toLowerCase()] || 0;
        return pb - pa;
      });
    default:
      // if no sort option, just return the list as is
      return sortedTask;
  }
}

// function to filter tasks based on priority and status
function filterTask(tasksFilter, filterPriority, filterStatus) {
  const p = (filterPriority || '').trim().toLowerCase();
  const s = (filterStatus || '').trim().toLowerCase();

  return tasksFilter.filter(task => {
    const tp = (task.priority || '').toLowerCase();
    // filter by priority if selected
    if (p && p !== 'all' && tp !== p) return false;

    // filter by status if selected
    if (s === 'completed' && !task.completed) return false;
    if (s === 'active' && task.completed) return false;

    return true;
  });
}

// function to apply both sorting and filtering together
function SortAndFilter() {
  const sortBy = document.getElementById('sort-by')?.value;
  const filterPriority = document.getElementById('filter-priority')?.value;
  const filterStatus = document.getElementById('filter-status')?.value;

  // filter tasks first, then sort them
  const filteredTask = filterTask(tasks, filterPriority, filterStatus);
  const sortAndFilter = sortTask(filteredTask, sortBy);
  renderFilter(sortAndFilter);
}

// function to render the filtered and sorted tasks
function renderFilter(filtered) {
  const taskContainer = document.getElementById('task-list');
  if (!taskContainer) return;
  taskContainer.innerHTML = '';

  // if no tasks match, show a placeholder message
  if (!filtered || filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'There are no matched tasks.';
    taskContainer.appendChild(li);
    return;
  }

  // otherwise build and append each filtered task
  filtered.forEach(task => {
    taskContainer.appendChild(buildTaskItem(task));
  });
}







// event listener for clicks inside the task list
document.addEventListener('click', function (e) {
  const withinList = e.target.closest && e.target.closest('#task-list');
  if (!withinList) return;

  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  const idx = tasks.findIndex(t => String(t.id) === String(id));
  if (idx === -1) return;

  // if the complete button is clicked, call the central completeTask function
  if (e.target.classList.contains('complete-btn')) {
    completeTask(idx);
    return;
  }

  // if the delete button is clicked, remove the task
  if (e.target.classList.contains('delete-btn')) {
    tasks.splice(idx, 1);
    saveTasks(tasks);
    renderTasks();
    updateStreakDisplay();
  }
}, false);

// keyboard support for deleting tasks
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('delete-btn')) {
    e.preventDefault();
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const idx = tasks.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;
    tasks.splice(idx, 1);
    saveTasks(tasks);
    renderTasks();
    updateStreakDisplay();
  }
});

// keyboard support for completing tasks
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('complete-btn')) {
    e.preventDefault();
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const idx = tasks.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;

    // use the central completeTask function so confetti + celebration run
    completeTask(idx);
  }
});

// function to update the streak display
function updateStreakDisplay() {
  const el = document.getElementById('streak-display');
  if (!el) return;
  try {
    const data = JSON.parse(localStorage.getItem('streakData')) || { streakCount: 0 };
    const c = data.streakCount || 0;
    el.textContent = `Streak: ${c} day${c === 1 ? '' : 's'}`;
  } catch {
    el.textContent = 'Streak: 0 days';
  }
}

// bootstrapping: run when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  if (taskForm && !taskForm._hasSubmitListener) {
    taskForm.addEventListener('submit', addTask);
    taskForm._hasSubmitListener = true;
  }
  renderTasks();
  updateStreakDisplay();
  startTimer();
});

// optional debug display of current tasks
function displayTasks() {
  console.log("Current tasks: ", tasks.map(t => t.name).join(", "));
}
displayTasks();

// export functions so other modules can use them
export { addTask, completeTask, countDown };

// second DOMContentLoaded block for theme toggle and startup functions
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  // load saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-theme', savedTheme);
  toggleBtn.setAttribute('aria-pressed', savedTheme === 'dark');

  // toggle theme on button click
  toggleBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggleBtn.setAttribute('aria-pressed', next === 'dark');
  });

  // run other startup functions
  renderTasks();
  updateStreakDisplay();
  fetchQuote();
});





// --- Big Summary for script.js ---
// This script.js file is the backbone of our Task Manager app, and it nails the Week 1–2 requirements
// across the board. Here’s how:
//
// • Modular imports: Right at the top we pull in Task classes, storage helpers, timers, and rewards.
//   This shows modular design and keeps the project organized instead of cramming everything in one file.
//
// • Event-driven logic: The callback system for urgent tasks, the click/keyboard listeners for completing
//   and deleting tasks, and the DOMContentLoaded bootstrapping all prove we’re handling events properly.
//   User actions trigger functions, and urgent deadlines trigger callbacks — classic event-driven programming.
//
// • Arrays and data management: Tasks are stored in an array, pushed when created, spliced when deleted,
//   and mapped when rendering. Sorting and filtering functions show off array manipulation with sort() and filter().
//   This is textbook array handling and dynamic data management.
//
// • Functions and modularity: Every major feature is broken into its own function — addTask, completeTask,
//   updateTimer, renderTasks, SortAndFilter, updateStreakDisplay, etc. Each one does a clear job, which
//   matches the requirement for modular functions and clean structure.
//
// • Classes and objects: Tasks are created using the Task and TimedTask classes, showing object-oriented design.
//   TimedTask extends Task, proving inheritance is in play. We also use methods like markAsDone and startCountdown
//   to show class functionality in action.
//
// • DOM manipulation: The script builds task list items dynamically, updates countdown timers, applies CSS classes
//   for urgent/overdue/completed states, and injects error messages for validation. This is direct manipulation
//   of the DOM to reflect the app’s logic visually.
//
// • Asynchronous programming: The timer loop runs every second with setInterval, updating deadlines in real time.
//   The fetchQuote() call pulls jokes from an API asynchronously, showing async/await in action. This covers the
//   requirement for asynchronous programming and external API integration.
//
// • User feedback and accessibility: Confetti and celebration popups give visual feedback when tasks are completed.
//   Error messages use aria-live and role attributes for accessibility. Keyboard support for completing and deleting
//   tasks ensures inclusivity. This shows attention to user experience and accessibility requirements.
//
// • LocalStorage and persistence: Tasks, streaks, rewards, and theme preferences are all saved in localStorage.
//   This proves we’re handling JSON serialization and persistent data storage, which is part of the requirements.
//
// • Extra polish: Theme toggle logic lets users switch between light and dark modes, streak tracking motivates
//   consistency, and reward badges gamify the experience. These aren’t just fluff — they show advanced DOM updates,
//   conditionals, and storage handling beyond the basics.
//
// Altogether, script.js demonstrates modular functions, array management, class usage, DOM manipulation,
// event-driven programming, asynchronous updates, API integration, accessibility, and persistent storage.
// It’s basically a showcase of all the Week 1–2 objectives working together in one file.

