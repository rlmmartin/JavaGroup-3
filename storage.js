// storage.js

import { Task, TimedTask } from './app.js'; // recreate instances on load - added by Raymond

const STORAGE_KEY = 'ravp_tasks_v1'; // use a stable key to avoid collisions - added by Raymond

export function saveTasks(tasks) { // replace dummy save - added by Raymond
  try {
    // ensure we store plain serializable objects (not class prototypes)
    const serializable = (Array.isArray(tasks) ? tasks : []).map(t => {
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        priority: t.priority,
        deadline: t.deadline,
        completed: !!t.completed,
        // only include timeLeft for TimedTask-like objects
        timeLeft: t.timeLeft !== undefined ? t.timeLeft : undefined
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable)); // persist task array - added by Raymond
    console.log("Tasks saved."); // keep simple log - added by Raymond
    return true;
  } catch (err) {
    console.warn('saveTasks failed', err); // debug - added by Raymond
    return false;
  }
}

export function loadTasks() { // replace dummy load - added by Raymond
  const data = localStorage.getItem(STORAGE_KEY); // read raw - added by Raymond
  if (!data) return []; // safe empty - added by Raymond
  try {
    const parsed = JSON.parse(data); // parse stored JSON - added by Raymond
    if (!Array.isArray(parsed)) return []; // guard - added by Raymond

    return parsed.map(t => {
      // defensive defaults
      const id = t && t.id !== undefined ? t.id : String(Math.random()).slice(2);
      const name = t && t.name ? t.name : 'Untitled task';
      const description = t && t.description ? t.description : '';
      const priority = t && t.priority ? t.priority : '';
      const deadline = t && t.deadline ? t.deadline : '';
      const completed = !!(t && t.completed);

      // reconstruct TimedTask if it looks like one (has timeLeft)
      if (t && t.timeLeft !== undefined) {
        try {
          const tt = new TimedTask(name, description, priority, deadline, t.timeLeft, id); // reconstruct TimedTask - added by Raymond
          tt.completed = completed; // restore completed state — added by Raymond
          return tt;
        } catch (err) {
          console.warn('Reconstructing TimedTask failed, falling back to plain Task', err); // debug - added by Raymond
          const fallback = new Task(name, description, priority, deadline, id);
          fallback.completed = completed;
          return fallback;
        }
      } else {
        try {
          const task = new Task(name, description, priority, deadline, id); // reconstruct Task — added by Raymond
          task.completed = completed; // restore completed state - added by Raymond
          return task;
        } catch (err) {
          console.warn('Reconstructing Task failed, using plain object fallback', err); // debug -added by Raymond
          // return a plain object that still matches the shape used by the UI
          return { id, name, description, priority, deadline, completed };
        }
      }
    });
  } catch (err) {
    console.error('Failed to load tasks:', err); // debug on parse error - added by Raymond
    return []; // fallback empty - added by Raymond
  }
}