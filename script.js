import { Task, TimedTask} from './app.js';
let tasks = [];
//add task
function addTask(e) {
    e.preventDefault();
    //Get value from the form
    let name = document.getElementById('task-name').value;
    let description = document.getElementById('task-desc').value;
    let priority = document.getElementById('task-priority').value;
    let deadline = document.getElementById('task-deadline').value;

    let task = new Task(name, description, priority, deadline);
    tasks.push(task); //adding tasks to the arrays
    console.log("New task added:", task); 
    task.showDetails(); //use showDetails in class
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
        } else if (e.target.tagName === 'SPAN'){    //Delete when hit the cross
            e.target.parentElement.remove();
        }
    }, false);
    document.getElementById('task-form').reset(); //reset input after submitting

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
    task.markAsDone(); //using markAsDone in class
    console.log("Task completed: ", task.name);
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
    console.log("Current tasks: ", tasks.map(tasks => tasks.name).join(", "));
}

displayTasks();
export { addTask, completeTask, countDown }
