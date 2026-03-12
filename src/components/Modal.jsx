import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, isOverdue, getPriorityColor, getAvatarColor, getInitials } from '../utils/helpers';

function TaskDetailModal({ task, onClose }) {
  const { state, dispatch, addNotification } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...task });
  const project = state.projects.find(p => p.id === task.projectId);
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  const save = () => {
    dispatch({ type: 'UPDATE_TASK', payload: form });
    addNotification('Task updated successfully', 'success');
    setEditing(false);
  };

  const deleteTask = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    addNotification('Task deleted', 'warning');
    onClose();
  };

  return (
    <div className="modal-content task-detail-modal">
      <div className="modal-header" style={{ borderBottom: `2px solid ${project?.color || '#333'}` }}>
        <div className="modal-title-group">
          {editing ? (
            <input className="modal-title-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          ) : (
            <h2>{task.title}</h2>
          )}
          <div className="modal-meta">
            <span className={`status-badge status-${task.status}`}>{task.status}</span>
            <span className="priority-badge" style={{ color: getPriorityColor(task.priority) }}>● {task.priority}</span>
          </div>
        </div>
        <div className="modal-header-actions">
          <button className="icon-btn" onClick={() => setEditing(!editing)}>{editing ? '✓ Save' : '✎ Edit'}</button>
          {editing && <button className="icon-btn danger" onClick={deleteTask}><Trash2 size={14} /></button>}
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
      </div>
      <div className="modal-body">
        <div className="detail-grid">
          <div className="detail-field">
            <label><User size={13} /> Assignee</label>
            {editing ? (
              <input value={form.assignee || ''} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
            ) : (
              <div className="assignee-display">
                <div className="mini-avatar" style={{ background: getAvatarColor(task.assignee) }}>{getInitials(task.assignee)}</div>
                <span>{task.assignee || '—'}</span>
              </div>
            )}
          </div>
          <div className="detail-field">
            <label><Calendar size={13} /> Due Date</label>
            {editing ? (
              <input type="date" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            ) : (
              <span className={overdue ? 'text-danger' : ''}>{overdue && <AlertCircle size={12} />} {formatDate(task.dueDate)}</span>
            )}
          </div>
          <div className="detail-field">
            <label>Status</label>
            {editing ? (
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['todo', 'in-progress', 'review', 'done'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : <span className={`status-badge status-${task.status}`}>{task.status}</span>}
          </div>
          <div className="detail-field">
            <label>Priority</label>
            {editing ? (
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : <span style={{ color: getPriorityColor(task.priority) }}>● {task.priority}</span>}
          </div>
        </div>
        <div className="detail-field full">
          <label>Description</label>
          {editing ? (
            <textarea rows={4} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          ) : (
            <p className="desc-text">{task.description || 'No description provided.'}</p>
          )}
        </div>
        {project && (
          <div className="detail-project-badge" style={{ borderColor: project.color, color: project.color }}>
            <span className="dpb-dot" style={{ background: project.color }} />
            {project.name}
          </div>
        )}
        {editing && (
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => { setEditing(false); setForm({ ...task }); }}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddTaskModal({ defaultStatus, onClose }) {
  const { state, dispatch, addNotification } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', status: defaultStatus || 'todo',
    priority: 'medium', assignee: '', dueDate: '',
    projectId: state.activeProject || state.projects[0]?.id || '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const submit = () => {
    if (!form.title.trim()) return;
    dispatch({ type: 'ADD_TASK', payload: form });
    addNotification(`Task "${form.title}" created!`, 'success');
    onClose();
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <div className="modal-content add-task-modal">
      <div className="modal-header">
        <h2>New Task</h2>
        <button className="icon-btn" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label>Title *</label>
          <input placeholder="Task title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} placeholder="What needs to be done?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Project</label>
            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
              {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['todo', 'in-progress', 'review', 'done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label>Assignee</label>
          <input placeholder="Name..." value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Tags (press Enter)</label>
          <input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
          <div className="tag-list">
            {form.tags.map(tag => (
              <span key={tag} className="tc-tag">
                {tag}
                <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.title.trim()}>Create Task</button>
        </div>
      </div>
    </div>
  );
}

function AddProjectModal({ onClose }) {
  const { dispatch, addNotification } = useApp();
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', priority: 'medium', dueDate: '', members: [], status: 'planning', progress: 0, tags: [] });
  const [memberInput, setMemberInput] = useState('');

  const submit = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'ADD_PROJECT', payload: form });
    addNotification(`Project "${form.name}" created!`, 'success');
    onClose();
  };

  const addMember = (e) => {
    if (e.key === 'Enter' && memberInput.trim()) {
      setForm(f => ({ ...f, members: [...f.members, memberInput.trim()] }));
      setMemberInput('');
    }
  };

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#f97316'];

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2>New Project</h2>
        <button className="icon-btn" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label>Project Name *</label>
          <input placeholder="Project name..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {colors.map(c => (
              <button key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label>Team Members (press Enter)</label>
          <input placeholder="Member name..." value={memberInput} onChange={e => setMemberInput(e.target.value)} onKeyDown={addMember} />
          <div className="tag-list">
            {form.members.map(m => (
              <span key={m} className="tc-tag">{m} <button onClick={() => setForm(f => ({ ...f, members: f.members.filter(x => x !== m) }))}>×</button></span>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Create Project</button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }) {
  const { state, dispatch, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('Chethan Sai Pothanuru');
  const [role, setRole] = useState('Project Lead');
  const [email, setEmail] = useState('chethan@flowspace.io');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'appearance', label: '🎨 Appearance' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'about', label: 'ℹ️ About' },
  ];

  const saveProfile = () => {
    addNotification('Profile settings saved!', 'success');
    onClose();
  };

  return (
    <div className="modal-content settings-modal">
      <div className="modal-header">
        <h2>Settings</h2>
        <button className="icon-btn" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="settings-layout">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`settings-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="settings-panel">

          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Profile Information</h3>
              <div className="settings-avatar-row">
                <div className="settings-avatar" style={{ background: '#6366f1' }}>CS</div>
                <div>
                  <p className="settings-avatar-name">{name}</p>
                  <p className="settings-avatar-role">{role}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Role / Title</label>
                <input value={role} onChange={e => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={saveProfile}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Appearance</h3>
              <div className="settings-option-label">Theme</div>
              <div className="theme-options">
                <button
                  className={`theme-option ${state.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => { dispatch({ type: 'SET_THEME', payload: 'dark' }); addNotification('Dark theme applied', 'info'); }}
                >
                  <span className="theme-preview dark-preview" />
                  <span>Dark</span>
                  {state.theme === 'dark' && <span className="theme-check">✓</span>}
                </button>
                <button
                  className={`theme-option ${state.theme === 'light' ? 'active' : ''}`}
                  onClick={() => { dispatch({ type: 'SET_THEME', payload: 'light' }); addNotification('Light theme applied', 'info'); }}
                >
                  <span className="theme-preview light-preview" />
                  <span>Light</span>
                  {state.theme === 'light' && <span className="theme-check">✓</span>}
                </button>
              </div>
              <div className="settings-divider" />
              <div className="settings-toggle-row">
                <div>
                  <div className="settings-option-label">Compact Mode</div>
                  <div className="settings-option-desc">Reduce spacing and padding across the UI</div>
                </div>
                <button
                  className={`toggle-btn ${compactMode ? 'on' : ''}`}
                  onClick={() => { setCompactMode(!compactMode); addNotification(`Compact mode ${!compactMode ? 'enabled' : 'disabled'}`, 'info'); }}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Notification Preferences</h3>
              <div className="settings-toggle-row">
                <div>
                  <div className="settings-option-label">Enable Notifications</div>
                  <div className="settings-option-desc">Show alerts for task updates and project changes</div>
                </div>
                <button
                  className={`toggle-btn ${notifEnabled ? 'on' : ''}`}
                  onClick={() => setNotifEnabled(!notifEnabled)}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
              <div className="settings-divider" />
              <div className="settings-toggle-row">
                <div>
                  <div className="settings-option-label">Sound Alerts</div>
                  <div className="settings-option-desc">Play a sound when new notifications arrive</div>
                </div>
                <button
                  className={`toggle-btn ${notifSound ? 'on' : ''}`}
                  onClick={() => setNotifSound(!notifSound)}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
              <div className="settings-divider" />
              <div className="settings-option-label" style={{ marginBottom: 8 }}>Unread Notifications</div>
              <div className="notif-count-badge">
                {state.notifications.filter(n => !n.read).length} unread messages
              </div>
              <button
                className="btn-secondary"
                style={{ marginTop: 12 }}
                onClick={() => {
                  state.notifications.forEach(n => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }));
                  addNotification('All notifications marked as read', 'success');
                }}
              >
                Mark All as Read
              </button>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h3 className="settings-section-title">About Flowspace</h3>
              <div className="about-logo-row">
                <div className="about-logo">⚡</div>
                <div>
                  <p className="about-app-name">Flowspace</p>
                  <p className="about-version">Version 1.0.0</p>
                </div>
              </div>
              <div className="settings-divider" />
              <div className="about-info-grid">
                <div className="about-info-item"><span>Framework</span><strong>React 18</strong></div>
                <div className="about-info-item"><span>State</span><strong>useReducer + Context</strong></div>
                <div className="about-info-item"><span>Charts</span><strong>Recharts</strong></div>
                <div className="about-info-item"><span>Drag & Drop</span><strong>@hello-pangea/dnd</strong></div>
                <div className="about-info-item"><span>Icons</span><strong>Lucide React</strong></div>
                <div className="about-info-item"><span>Fonts</span><strong>Syne + DM Mono</strong></div>
              </div>
              <div className="settings-divider" />
              <p className="about-desc">
                A production-grade project management dashboard built for React developers.
                Features Kanban board, analytics, notifications, and full dark/light theming.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Modal() {
  const { state, dispatch } = useApp();
  const modal = state.modal;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch({ type: 'SET_MODAL', payload: null }); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!modal) return null;

  const onClose = () => dispatch({ type: 'SET_MODAL', payload: null });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {modal.type === 'task-detail' && <TaskDetailModal task={modal.task} onClose={onClose} />}
      {modal.type === 'add-task' && <AddTaskModal defaultStatus={modal.defaultStatus} onClose={onClose} />}
      {modal.type === 'add-project' && <AddProjectModal onClose={onClose} />}
      {modal.type === 'settings' && <SettingsModal onClose={onClose} />}
    </div>
  );
}
