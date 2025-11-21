import { Task, TimedTask } from './app.js';
import { saveTasks, loadTasks } from './storage.js'; // replace dummy storage — added by Raymond
import { requestNotificationPermission, fetchQuote } from "./timers.js";   // <-- added

requestNotificationPermission();   // <-- added
fetchQuote(); // <-- added

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
      task = new Task(name, description, priority, deadline); // construct Task safely — added by Raymond
    } catch (err) {
      console.error('Task constructor failed:', err); // surface constructor errors — added by Raymond
      return;
    }

    tasks.push(task);
    saveTasks(tasks);              // <-- added - use real save - added by Raymond

    console.log("New task added:", task);
    if (typeof task.showDetails === 'function') task.showDetails();

    //Adding to list
    // moved to renderTasks() - added by Raymond

    //Delete task
    // handled by delegated listener - added by Raymond

    document.getElementById('task-form').reset();
    document.getElementById('task-name').focus(); // focus for quick entry - added by Raymond

    //Complete button
    // handled by delegated listener - added by Raymond

    renderTasks(); // re-render list - added by Raymond
    return task;
}

// attach submit listener after DOM ready to avoid timing issues - added by Raymond
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  if (taskForm && !taskForm._hasSubmitListener) {
    taskForm.addEventListener('submit', addTask);
    taskForm._hasSubmitListener = true; // prevent duplicate attachments - added by Raymond
  } else if (!taskForm) {
    console.error('No #task-form found in DOM'); // debug guard - added by Raymond
  }

  // initial paint after DOM ready - added by Raymond
  renderTasks();
});


//complete task
function completeTask(index){
    let task = tasks[index];
    if (!task) return;
    if (typeof task.markAsDone === 'function') {
      task.markAsDone();
    } else {
      task.completed = true;
    }
    console.log("Task completed: ", task.name);
    saveTasks(tasks);              // <-- added - use real save -- added by Raymond
}

//countdown
function countDown(){
    tasks.forEach(task =>{
        if(task instanceof TimedTask) {
            task.startCountdown();
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
    const taskContainer = document.getElementById('task-list'); // reuse container - added by Raymond
    if (!taskContainer) {
      console.error('No #task-list found'); // guard - added by Raymond
      return;
    }
    taskContainer.innerHTML = ''; // clear before render - added by Raymond

    if (!Array.isArray(tasks) || tasks.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No tasks yet.';
      taskContainer.appendChild(li);
      return;
    }

    tasks.forEach(task => {
        let li = document.createElement('li'); // list item - added by Raymond
        li.dataset.id = task.id; // bind unique id - added by Raymond

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
        completeBtn.type = 'button';
        completeBtn.disabled = !!task.completed; // disable if done - added by Raymond

        // Visual strike-through if completed - added by Raymond
        if (task.completed) li.style.textDecoration = 'line-through';

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

    const li = e.target.closest('li'); // find item - added by Raymond
    if (!li) return; // guard - added by Raymond
    const id = li.dataset.id; // read id - added by Raymond
    const idx = tasks.findIndex(t => t.id === id); // locate task - added by Raymond
    if (idx === -1) return; // guard - added by Raymond

    //complete task when hit the complete button
    if(e.target.classList.contains('complete-btn')) { // robust class check - added by Raymond
        if (typeof tasks[idx].markAsDone === 'function') tasks[idx].markAsDone(); // update model - added by Raymond
        else tasks[idx].completed = true;
        saveTasks(tasks); // persist - added by Raymond
        renderTasks(); // refresh UI - added by Raymond
        return; // stop - added by Raymond
    }

    // DELETE FROM PAGE & SAVE CHANGES (new code)
    if (e.target.classList.contains('delete-btn')) { // specific class - added by Raymond
        tasks.splice(idx, 1); // remove from array - added by Raymond
        saveTasks(tasks); // persist - added by Raymond
        renderTasks(); // refresh UI - added by Raymond
    }
}, false);

// initial paint (in case DOMContentLoaded already fired) - added by Raymond
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  renderTasks();
}

export { addTask, completeTask, countDown };

// NOV 20th Changes and modifications by Raymond
// Approximately 35% of script.js was altered (rough estimate based on additions, replacements, and moved logic).
// Added a single delegated click handler, id-based DOM binding, a central renderTasks function, real save/load calls, initial render on load, and minimal input validation to ensure reliable add/complete/delete behavior and persistence — changed by Raymond