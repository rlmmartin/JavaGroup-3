// bringing in Task and TimedTask classes so we can rebuild tasks when loading from storage
import { Task, TimedTask } from './app.js';

// this is the key we use in localStorage to save all tasks
const STORAGE_KEY = 'ravp_tasks_v1';

// this function saves tasks into localStorage
export function saveTasks(tasks) {
  try {
    // make sure we have an array, then map each task into a plain object
    const serializable = (Array.isArray(tasks) ? tasks : []).map(t => {
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        priority: t.priority,
        deadline: t.deadline,
        completed: !!t.completed, // force to boolean
        timeLeft: t.timeLeft !== undefined ? t.timeLeft : undefined
      };
    });
    // turn the array into JSON and store it
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    return true;
  } catch (err) {
    // if something goes wrong, return false
    return false;
  }
}

// this function loads tasks back out of localStorage
export function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // rebuild each task from the stored data
    return parsed.map(t => {
      const id = t?.id ?? String(Math.random()).slice(2);
      const name = t?.name ?? 'Untitled task';
      const description = t?.description ?? '';
      const priority = t?.priority ?? '';
      const deadline = t?.deadline ?? '';
      const completed = !!t?.completed;

      // if timeLeft is stored, try to rebuild as a TimedTask
      if (t && t.timeLeft !== undefined) {
        try {
          const tt = new TimedTask(name, description, priority, deadline, t.timeLeft, id);
          tt.completed = completed;
          return tt;
        } catch (err) {
          // fallback to a normal Task if TimedTask fails
          const fallback = new Task(name, description, priority, deadline, id);
          fallback.completed = completed;
          return fallback;
        }
      } else {
        // otherwise just rebuild as a normal Task
        try {
          const task = new Task(name, description, priority, deadline, id);
          task.completed = completed;
          return task;
        } catch (err) {
          // if even that fails, return a plain object
          return { id, name, description, priority, deadline, completed };
        }
      }
    });
  } catch {
    // if parsing fails, return an empty array
    return [];
  }
}

// streak system added here
export function getStreakData() { 
    // grab streak info from localStorage, or return default values
    const data = localStorage.getItem("streakData");
    return data ? JSON.parse(data) : { lastCompleted: null, streakCount: 0 }; 
}

export function updateStreak() { 
    // figure out today’s date
    const streak = getStreakData();
    const today = new Date().toLocaleDateString();

    // if we already marked today, just return
    if (streak.lastCompleted === today) {
        return streak;
    }

    // check if last completed was yesterday
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    if (streak.lastCompleted === yesterday) {
        streak.streakCount += 1; 
    } else {
        // reset streak if not consecutive
        streak.streakCount = 1; 
    }

    // update lastCompleted to today and save
    streak.lastCompleted = today;
    saveStreakData(streak);
    return streak;
}

// helper to save streak info back into localStorage
function saveStreakData(obj) { 
    localStorage.setItem("streakData", JSON.stringify(obj)); 
}




// --- Summary for this file ---
// This storage.js module covers key Week 1–2 requirements:
// - It uses JavaScript syntax and statements (if/else, try/catch, mapping).
// - It manages arrays dynamically by saving and loading tasks with map() and JSON.
// - It has modular functions like saveTasks, loadTasks, getStreakData, and updateStreak.
// - It’s separated into its own module, keeping the project organized and reusable.
// - It shows JSON handling by converting tasks to and from JSON in localStorage.
// - It uses classes (Task and TimedTask) to rebuild objects when loading data.
// Altogether, this file demonstrates array management, modular functions, JSON handling,
// and class usage, which line up with our Week 1–2 tasks.
