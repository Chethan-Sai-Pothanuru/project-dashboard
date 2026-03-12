import React from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, Trash2, Plus, ExternalLink, Calendar, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, getAvatarColor, getInitials } from '../utils/helpers';

export function Notifications() {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  const iconMap = { success: CheckCircle, info: Info, warning: AlertTriangle };
  const colorMap = { success: '#10b981', info: '#3b82f6', warning: '#f59e0b' };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">{notifications.filter(n => !n.read).length} unread</p>
        </div>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 && <div className="empty-state">No notifications yet</div>}
        {notifications.map(n => {
          const Icon = iconMap[n.type] || Info;
          const color = colorMap[n.type] || '#6b7280';
          return (
            <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}>
              <div className="notif-icon" style={{ color, background: `${color}22` }}><Icon size={16} /></div>
              <div className="notif-body">
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">{new Date(n.timestamp).toLocaleTimeString()}</span>
              </div>
              {!n.read && <span className="unread-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectsList({ setActiveView }) {
  const { state, dispatch } = useApp();

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">{state.projects.length} active projects</p>
        </div>
        <button className="btn-primary" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'add-project' } })}>
          <Plus size={15} /> New Project
        </button>
      </div>
      <div className="projects-grid">
        {state.projects.map(project => {
          const tasks = state.tasks.filter(t => t.projectId === project.id);
          const done = tasks.filter(t => t.status === 'done').length;
          return (
            <div key={project.id} className="project-card" style={{ '--accent': project.color }}>
              <div className="pc-accent-bar" style={{ background: project.color }} />
              <div className="pc-header">
                <h3>{project.name}</h3>
                <span className={`status-badge status-${project.status}`}>{project.status}</span>
              </div>
              <p className="pc-description">{project.description}</p>
              <div className="pc-tags">
                {project.tags?.map(tag => <span key={tag} className="tc-tag">{tag}</span>)}
              </div>
              <div className="pc-progress">
                <div className="pc-progress-bar">
                  <div className="pc-progress-fill" style={{ width: `${project.progress}%`, background: project.color }} />
                </div>
                <span>{project.progress}%</span>
              </div>
              <div className="pc-stats">
                <div className="pc-stat"><BarChart2 size={13} /><span>{tasks.length} tasks</span></div>
                <div className="pc-stat"><CheckCircle size={13} style={{ color: '#10b981' }} /><span>{done} done</span></div>
                <div className="pc-stat"><Calendar size={13} /><span>{formatDate(project.dueDate)}</span></div>
              </div>
              <div className="pc-members">
                {project.members?.slice(0, 4).map(m => (
                  <div key={m} className="mini-avatar" style={{ background: getAvatarColor(m) }} title={m}>{getInitials(m)}</div>
                ))}
                {(project.members?.length || 0) > 4 && <div className="mini-avatar overflow">+{project.members.length - 4}</div>}
              </div>
              <div className="pc-actions">
                <button className="btn-secondary sm" onClick={() => { dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id }); setActiveView('board'); }}>
                  <ExternalLink size={13} /> Open Board
                </button>
                <button className="btn-danger sm" onClick={() => { dispatch({ type: 'DELETE_PROJECT', payload: project.id }); }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Header({ activeView }) {
  const { state, dispatch } = useApp();
  const unread = state.notifications.filter(n => !n.read).length;
  const viewLabels = { dashboard: 'Dashboard', projects: 'Projects', board: 'Kanban Board', analytics: 'Analytics', notifications: 'Notifications' };

  return (
    <header className="app-header">
      <div className="breadcrumb">
        <span className="breadcrumb-root">Flowspace</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{viewLabels[activeView] || activeView}</span>
      </div>
      <div className="header-right">
        <button
          className={`theme-toggle ${state.theme}`}
          onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })}
        >
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="notif-btn" onClick={() => {}}>
          <Bell size={18} />
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </button>
      </div>
    </header>
  );
}
