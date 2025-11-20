import { Task, TimedTask } from './app.js';
import { saveTasksDummy, loadTasksDummy } from './storage.js';    // <-- added
import { requestNotificationPermission, fetchQuote } from "./timers.js";   // <-- added

requestNotificationPermission();   // <-- added
fetchQuote(); // <-- added
// Load saved tasks
let tasks = loadTasksDummy();           // <-- added
window.tasks = tasks;              // <-- added

//add task
function addTask(e) {
    e.preventDefault();
    //Get value from the form
    let name = document.getElementById('task-name').value;
    let description = document.getElementById('task-desc').value;
    let priority = document.getElementById('task-priority').value;
    let deadline = document.getElementById('task-deadline').value;

    let task = new Task(name, description, priority, deadline);
    tasks.push(task); 
    saveTasks(tasks);              // <-- added

    console.log("New task added:", task); 
    task.showDetails();

    //Adding to list
    let taskContainer = document.getElementById('task-list');
    let li = document.createElement('li');
    li.innerHTML = "Task: " + task.name + " - Description: " + task.description + " - Priority: " + task.priority + " - Due: " + task.deadline;
    taskContainer.appendChild(li);
    
    //Delete task 
    let del = document.createElement('span');
    del.innerHTML = '\u00d7';
    del.className = 'delete-btn';
    li.appendChild(del);

    taskContainer.addEventListener('click', function(e){
        //complete task when hit the complete button
        if(e.target.className === 'complete-btn') {
            e.target.parentElement.style.textDecoration = 'line-through';
            e.target.disabled = true;
            e.target.textContent = 'Completed!';

        } else if (e.target.tagName === 'SPAN'){    
            // DELETE FROM PAGE & SAVE CHANGES (new code)
            e.target.parentElement.remove();   // <-- changed
            
            let deletedTaskName = e.target.parentElement.textContent
                .split(" - ")[0]
                .replace("Task: ", "");        // <-- added
            
            tasks = tasks.filter(t => t.name !== deletedTaskName);   // <-- added
            saveTasks(tasks);                  // <-- added
        }
    }, false);

    document.getElementById('task-form').reset(); 

    //Complete button 
    let completeBtn = document.createElement('button');
    completeBtn.innerHTML = 'Complete';
    completeBtn.className = 'complete-btn';
    li.appendChild(completeBtn);
    return task;
}

let taskForm = document.getElementById('task-form');
taskForm.addEventListener('submit', addTask);

//complete task
function completeTask(index){
    let task = tasks[index];
    task.markAsDone(); 
    console.log("Task completed: ", task.name);
    saveTasks(tasks);              // <-- added
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
export { addTask, completeTask, countDown };
