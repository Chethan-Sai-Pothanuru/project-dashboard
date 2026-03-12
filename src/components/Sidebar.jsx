import React, { useState } from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials } from '../utils/helpers';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'board', label: 'Kanban Board', icon: CheckSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar({ activeView, setActiveView }) {
  const { state, dispatch } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? 72 : 240 }}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"><Zap size={18} /></div>
          {!collapsed && <span className="logo-text">Flowspace</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => setActiveView(id)}
            title={collapsed ? label : ''}
          >
            <div className="nav-icon-wrapper">
              <Icon size={18} />
              {id === 'notifications' && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </div>
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-projects">
          <div className="sidebar-section-title">
            <span>Projects</span>
            <button className="add-btn" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'add-project' } })}>
              <Plus size={14} />
            </button>
          </div>
          {state.projects.map(project => (
            <button
              key={project.id}
              className={`project-item ${state.activeProject === project.id ? 'active' : ''}`}
              onClick={() => { dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id }); setActiveView('board'); }}
            >
              <span className="project-dot" style={{ background: project.color }} />
              <span className="project-name">{project.name}</span>
              <span className="project-progress">{project.progress}%</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-avatar" style={{ background: getAvatarColor('Chethan Sai Pothanuru') }}>
          {getInitials('Chethan Sai Pothanuru')}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">Chethan Sai Pothanuru</span>
            <span className="user-role">Project Lead</span>
          </div>
        )}
        {!collapsed && <Settings size={16} className="settings-icon" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'settings' } })} />}
      </div>
    </aside>
  );
}
