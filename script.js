import { Task, TimedTask } from './app.js';
import { saveTasks, loadTasks } from './storage.js';
import { requestNotificationPermission, fetchQuote } from "./timers.js";
import { updateStreak } from "./storage.js"; // Pietro added
import { checkRewards } from "./app.js"; // Pietro added

requestNotificationPermission();
fetchQuote();


//Callbacks
let eventCallback = {onUrgent: []};
function onCallback(event, callback){
  if(eventCallback[event]){
    eventCallback[event].push(callback);
  }
}
async function emitCallback(event, data){
  if(eventCallback[event]){
    eventCallback[event].forEach(callback => {
      try {
        callback(data);
      } catch {
        console.error("Callback failed", err);
      }
    });
  }
}

// Load saved tasks
let tasks = loadTasks() || [];           // <-- added — ensure array — added by Raymond
window.tasks = tasks;              // <-- added

//add task
function addTask(e) {
    e.preventDefault();
    //Get value from the form
    let name = document.getElementById('task-name').value;
    let description = document.getElementById('task-desc').value;
    let priority = document.getElementById('task-priority').value;
    let deadline = document.getElementById('task-deadline').value;

    let task;
    try {
      task = new TimedTask(name, description, priority, deadline); // construct Task safely — added by Raymond
    } catch (err) {
      return;
    }

    tasks.push(task);
    saveTasks(tasks);

    document.getElementById('task-form').reset();
    document.getElementById('task-name').focus();

    renderTasks();
    return task;
}

// attach submit listener after DOM ready to avoid timing issues - added by Raymond
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  if (taskForm && !taskForm._hasSubmitListener) {
    taskForm.addEventListener('submit', addTask);
    taskForm._hasSubmitListener = true;
  }

  startTimer();
  renderTasks();
});


//complete task
function completeTask(index){
    let task = tasks[index];
    if (!task) return;
    if (typeof task.markAsDone === 'function') task.markAsDone();
    else task.completed = true;
    saveTasks(tasks);
}

//Timers path:
//countdown
function countDown(){
    tasks.forEach(task =>{
        if(task instanceof TimedTask) task.startTimer();
    });
}

function startTimer(){   // Vu added
  setInterval(()=>{
    let sortBy = document.getElementById('sort-by').value;
    let filterPriority = document.getElementById('filter-priority').value;
    let filterStatus = document.getElementById('filter-status').value;
    let currentActive = sortBy || filterPriority || filterStatus;

    if(currentActive){
      SortAndFilter();
    } else {
      renderTasks();
    }
    updateTimer();
  }, 1000);
}

function updateTimer(){        // Vu added
  tasks.forEach(task => {
    if(!task.completed && task.deadline){
      let oldTimeLeft = task.timeLeft;
      const deadlineDate = new Date(task.deadline);

      //Set to end of the day 23:59:59
      deadlineDate.setHours(23, 59, 59, 999);
      task.timeLeft = deadlineDate.getTime() - Date.now();

      //prepare for emittion
      let wasUrgent = oldTimeLeft <= 3 * 60 * 60 * 1000 && task.timeLeft > 0; 
      let isUrgent = task.timeLeft <= 3 * 60 * 60 * 1000 && task.timeLeft > 0;
      if(isUrgent && !wasUrgent){
        emitCallback('onUrgent', task);
      }
      task.isUrgent = true;
    } else {
      task.isUrgent = false;
    }
  });
}
//display
function displayTasks(){
    console.log("Current tasks: ", tasks.map(t => t.name).join(", "));
}

displayTasks();

// central render function - added by Raymond
function renderTasks() {
    const taskContainer = document.getElementById('task-list');
    if (!taskContainer) return;
    taskContainer.innerHTML = '';

    if (!Array.isArray(tasks) || tasks.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No tasks yet.';
      taskContainer.appendChild(li);
      return;
    }

    tasks.forEach(task => {
        let li = document.createElement('li'); // list item - added by Raymond
        li.dataset.id = task.id; // bind unique id - added by Raymond

        //Urgent class:
        if(task.isUrgent){
          li.classList.add('urgent-task');
        }
        //Calculate time left
        let timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';

        if(task.timeLeft > 0){
          let day = Math.floor(task.timeLeft / (1000 * 60 * 60 * 24));
          let hour = Math.floor(task.timeLeft % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
          let minute = Math.floor((task.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          let second = Math.floor((task.timeLeft % (1000 * 60)) / 1000);
          if(day > 0){
            timeDisplay.innerHTML = `${day}d ${hour}h ${minute}m ${second}s`;
          } else {
            timeDisplay.innerHTML = `${hour}h ${minute}m ${second}s`;
          }
        }
        //Display
        if(task.isUrgent){
          timeDisplay.classList.add('urgent-time');
        } else if(task.timeLeft <= 0 && !task.completed){
          timeDisplay.innerHTML = 'OVERDUE!';
          timeDisplay.classList.add('overdue');
        } else if(task.completed){
          timeDisplay.innerHTML = 'Completed';
        }
        // Build main content with basic structure - added by Raymond
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
        // Delete control (kept as span for your CSS) - added by Raymond
        let del = document.createElement('span');
        del.innerHTML = '\u00d7';
        del.className = 'delete-btn';
        del.setAttribute('role', 'button');
        del.setAttribute('tabindex', '0');

        // Complete button - added by Raymond
        let completeBtn = document.createElement('button'); // button per task - added by Raymond
        completeBtn.innerHTML = task.completed ? 'Completed!' : 'Complete'; // reflect state - added by Raymond
        completeBtn.className = 'complete-btn';

        // Visual strike-through if completed - added by Raymond
        if (task.completed) {
          li.style.textDecoration = 'line-through';
        }

        // Assemble item
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.appendChild(completeBtn);
        actions.appendChild(del);

        li.appendChild(main);
        li.appendChild(actions);

        taskContainer.appendChild(li);
    });
}

// single delegated click handler - added by Raymond
document.addEventListener('click', function(e){
    // only handle clicks inside the task list to be safe - added by Raymond
    const withinList = e.target.closest && e.target.closest('#task-list');
    if (!withinList) return;

    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    if(e.target.classList.contains('complete-btn')) {
        if (typeof tasks[idx].markAsDone === 'function') tasks[idx].markAsDone();
        else tasks[idx].completed = true;

        updateStreak(); // Pietro added: updates streak when completing task
        checkRewards(); // Pietro added: checks reward on task complete

        saveTasks(tasks);
        renderTasks();
        return;
    }

    if (e.target.classList.contains('delete-btn')) {
        tasks.splice(idx, 1);
        saveTasks(tasks);
        renderTasks();
    }
}, false);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  renderTasks();
}

//sort/filter
function sortTask(tasks, sort){
  let sortedTask = [...tasks];
  //cases
  switch (sort) {
    case 'deadline':
      return sortedTask.sort((a, b)=>{
        const taskA = new Date(a.deadline);
        const taskB = new Date(b.deadline);
        return taskA - taskB;
      });

    case 'priority':
      const priorityOrder = {'High': 3, 'Medium': 2, 'Low': 1};
      return sortedTask.sort((a, b)=>{
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

    default:
      return sortedTask;
  }
}

function filterTask(tasksFilter, filterPriority, filterStatus){
  return tasksFilter.filter(task =>{
    if(filterPriority && task.priority && task.priority.toLowerCase() !== filterPriority.toLowerCase()){
      return false;
    }
    if(filterStatus === 'completed' && !task.completed) return false;
    if(filterStatus === 'active' && task.completed) return false;
    return true;
  });
}

function SortAndFilter(){
  let sortBy = document.getElementById('sort-by').value;
  let filterPriority = document.getElementById('filter-priority').value;
  let filterStatus = document.getElementById('filter-status').value;

  //Using sort/filter
  let filteredTask = filterTask(tasks, filterPriority, filterStatus); 
  let SortandFilter = sortTask(filteredTask, sortBy);
  renderFilter(SortandFilter);
}

function renderFilter(filtered){
  let taskContainer = document.getElementById('task-list');
  taskContainer.innerHTML = '';
  if(filtered.length === 0){
    let li = document.createElement('li');
    li.innerHTML = 'There are no matched tasks.';
    taskContainer.appendChild(li);
    return;
  }

  filtered.forEach(task =>{
    let li = document.createElement('li');
    li.dataset.id = task.id;

    if(task.isUrgent){
      li.classList.add('urgent-task');
    }

    let timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    if(task.timeLeft > 0){
      let day = Math.floor(task.timeLeft / (1000 * 60 * 60 * 24))
      let hour = Math.floor(task.timeLeft % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
      let minute = Math.floor((task.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      let second = Math.floor((task.timeLeft % (1000 * 60)) / 1000);
      if(day > 0){
        timeDisplay.innerHTML = `${day}d ${hour}h ${minute}m ${second}s`;
      } else {
        timeDisplay.innerHTML = `${hour}h ${minute}m ${second}s`;
      }
    }

    if(task.isUrgent){
      timeDisplay.classList.add('urgent-time');
    } else if(task.timeLeft <= 0 && !task.completed){
      timeDisplay.innerHTML = 'OVERDUE!';
      timeDisplay.classList.add('overdue');
    } else if(task.completed){
      timeDisplay.innerHTML = 'Completed';
    }
    // Build main content with basic structure - added by Raymond
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
    // Delete control (kept as span for your CSS) - added by Raymond
    let del = document.createElement('span');
    del.innerHTML = '\u00d7';
    del.className = 'delete-btn';
    del.setAttribute('role', 'button');
    del.setAttribute('tabindex', '0');

    // Complete button - added by Raymond
    let completeBtn = document.createElement('button'); // button per task - added by Raymond
    completeBtn.innerHTML = task.completed ? 'Completed!' : 'Complete'; // reflect state - added by Raymond
    completeBtn.className = 'complete-btn';

    // Visual strike-through if completed - added by Raymond
    if (task.completed) {
      li.style.textDecoration = 'line-through';
    }

    // Assemble item
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.appendChild(completeBtn);
    actions.appendChild(del);

    li.appendChild(main);
    li.appendChild(actions);

    taskContainer.appendChild(li);
  });
}

export { addTask, completeTask, countDown };
// NOV 20th Changes and modifications by Raymond
// Approximately 35% of script.js was altered (rough estimate based on additions, replacements, and moved logic).
// Added a single delegated click handler, id-based DOM binding, a central renderTasks function, real save/load calls, initial render on load, and minimal input validation to ensure reliable add/complete/delete behavior and persistence — changed by Raymond