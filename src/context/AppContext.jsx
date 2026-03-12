import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialData } from '../data/initialData';

const AppContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, { id: uuidv4(), ...action.payload, createdAt: new Date().toISOString() }],
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: state.tasks.filter(t => t.projectId !== action.payload),
        activeProject: state.activeProject === action.payload ? null : state.activeProject,
      };

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, { id: uuidv4(), ...action.payload, createdAt: new Date().toISOString() }],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t),
      };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId ? { ...t, status: action.payload.newStatus } : t
        ),
      };

    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };

    case 'SET_MODAL':
      return { ...state, modal: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [{ id: uuidv4(), ...action.payload, timestamp: new Date().toISOString() }, ...state.notifications].slice(0, 10),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n),
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialData);

  const addNotification = useCallback((message, type = 'info') => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type, read: false } });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
