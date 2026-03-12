import { format, isAfter, isBefore, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  try { return isBefore(parseISO(dateStr), new Date()); } catch { return false; }
};

export const isDueSoon = (dateStr, days = 3) => {
  if (!dateStr) return false;
  try {
    const due = parseISO(dateStr);
    const soon = new Date();
    soon.setDate(soon.getDate() + days);
    return isAfter(due, new Date()) && isBefore(due, soon);
  } catch { return false; }
};

export const getPriorityColor = (priority) => {
  const map = { high: '#ef4444', medium: '#f59e0b', low: '#10b981', critical: '#7c3aed' };
  return map[priority] || '#6b7280';
};

export const getStatusColor = (status) => {
  const map = { todo: '#6b7280', 'in-progress': '#3b82f6', done: '#10b981', review: '#f59e0b', blocked: '#ef4444' };
  return map[status] || '#6b7280';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#f97316'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const filterTasks = (tasks, filter) => {
  return tasks.filter(task => {
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
    if (filter.assignee !== 'all' && task.assignee !== filter.assignee) return false;
    if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });
};
