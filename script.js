import { Task, TimedTask} from './app.js';
let tasks = [];
//add task
function addTask(name, description, priority, deadline) {
    let task = new Task(name, description, priority, deadline);
    tasks.push(task); //adding tasks to the arrays
    console.log("New task added:", task); 
    task.showDetails(); //use showDetails in class
    return task; 
}

//delete task 
function deleteTask(index){
    let deletedTask = tasks.splice(index, 1)[0]; //delete task where the index is
    console.log("Task deleted: ", deletedTask.name);
}

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

//addTask test
addTask("Java Lab 7", "Daily work", "Medium", "11-16-2025")

//countDown test
let count = new TimedTask("Project task 1", "Required", "High", "11-30-2025", "432:00:00");
tasks.push(count); //adding timed task to array
completeTask(0); //start at first task, which is marked done
countDown(); //start countdown
displayTasks();
export { addTask, deleteTask, completeTask, countDown }
