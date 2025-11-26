// storage.js

import { Task, TimedTask } from './app.js';

const STORAGE_KEY = 'ravp_tasks_v1';

export function saveTasks(tasks) {
  try {
    const serializable = (Array.isArray(tasks) ? tasks : []).map(t => {
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        priority: t.priority,
        deadline: t.deadline,
        completed: !!t.completed,
        timeLeft: t.timeLeft !== undefined ? t.timeLeft : undefined
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    return true;
  } catch (err) {
    return false;
  }
}

export function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(t => {
      const id = t?.id ?? String(Math.random()).slice(2);
      const name = t?.name ?? 'Untitled task';
      const description = t?.description ?? '';
      const priority = t?.priority ?? '';
      const deadline = t?.deadline ?? '';
      const completed = !!t?.completed;

      if (t && t.timeLeft !== undefined) {
        try {
          const tt = new TimedTask(name, description, priority, deadline, t.timeLeft, id);
          tt.completed = completed;
          return tt;
        } catch (err) {
          const fallback = new Task(name, description, priority, deadline, id);
          fallback.completed = completed;
          return fallback;
        }
      } else {
        try {
          const task = new Task(name, description, priority, deadline, id);
          task.completed = completed;
          return task;
        } catch (err) {
          return { id, name, description, priority, deadline, completed };
        }
      }
    });
  } catch {
    return [];
  }
}

// Pietro added: streak system
export function getStreakData() { 
    const data = localStorage.getItem("streakData");
    return data ? JSON.parse(data) : { lastCompleted: null, streakCount: 0 }; 
}

export function updateStreak() { // Pietro added: handles daily streak update
    const streak = getStreakData();
    const today = new Date().toLocaleDateString();

    if (streak.lastCompleted === today) {
        return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    if (streak.lastCompleted === yesterday) {
        streak.streakCount += 1; 
    } else {
        streak.streakCount = 1; 
    }

    streak.lastCompleted = today;
    saveStreakData(streak);
    return streak;
}

function saveStreakData(obj) { 
    localStorage.setItem("streakData", JSON.stringify(obj)); 
} // Pietro added: persists streak info
