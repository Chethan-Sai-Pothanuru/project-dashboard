import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Folder, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, isOverdue, isDueSoon } from '../utils/helpers';
import { format, parseISO } from 'date-fns';
import { ChartTooltip } from './ChartTooltip';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}22`, color }}><Icon size={20} /></div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub" style={{ color }}>{sub}</div>}
    </div>
    {trend && <div className="stat-trend"><ArrowUpRight size={14} />{trend}</div>}
  </div>
);

export default function Dashboard({ setActiveView }) {
  const { state, dispatch } = useApp();

  const stats = useMemo(() => {
    const allTasks = state.tasks;
    const done = allTasks.filter(t => t.status === 'done').length;
    const inProg = allTasks.filter(t => t.status === 'in-progress').length;
    const overdue = allTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length;
    const dueSoon = allTasks.filter(t => isDueSoon(t.dueDate) && t.status !== 'done').length;
    return { total: allTasks.length, done, inProg, overdue, dueSoon };
  }, [state.tasks]);

  const chartData = useMemo(() =>
    state.activityData.slice(-14).map(d => ({
      ...d,
      date: format(parseISO(d.date), 'MMM d'),
    })), [state.activityData]);

  const pieData = useMemo(() => {
    const statuses = ['todo', 'in-progress', 'done', 'review'];
    const colors = ['#6b7280', '#3b82f6', '#10b981', '#f59e0b'];
    return statuses.map((s, i) => ({
      name: s,
      value: state.tasks.filter(t => t.status === s).length,
      color: colors[i],
    })).filter(d => d.value > 0);
  }, [state.tasks]);

  const recentTasks = useMemo(() =>
    [...state.tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [state.tasks]);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Good morning, Chethan 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects today.</p>
        </div>
        <button className="btn-primary" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'add-task' } })}>
          + New Task
        </button>
      </div>

      <div className="stats-grid">
        <StatCard icon={Folder} label="Total Tasks" value={stats.total} color="#6366f1" trend="+12%" sub={`${stats.done} completed`} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done} color="#10b981" trend="+5%" sub="this week" />
        <StatCard icon={Clock} label="In Progress" value={stats.inProg} color="#3b82f6" sub="across all projects" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="#ef4444" sub={`${stats.dueSoon} due soon`} />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Activity — Last 14 days</h3>
            <TrendingUp size={16} className="card-icon" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2} fill="url(#tasksGrad)" name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#completedGrad)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card pie-card">
          <div className="card-header"><h3>Task Status</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map(d => (
              <div key={d.name} className="legend-item">
                <span className="legend-dot" style={{ background: d.color }} />
                <span>{d.name}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Tasks</h3>
          <button className="link-btn" onClick={() => setActiveView('board')}>View Board →</button>
        </div>
        <div className="task-list">
          {recentTasks.map(task => {
            const project = state.projects.find(p => p.id === task.projectId);
            const overdue = isOverdue(task.dueDate) && task.status !== 'done';
            return (
              <div key={task.id} className="task-row" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'task-detail', task } })}>
                <div className="task-row-dot" style={{ background: project?.color || '#6b7280' }} />
                <div className="task-row-content">
                  <span className="task-row-title">{task.title}</span>
                  <span className="task-row-project">{project?.name}</span>
                </div>
                <span className={`status-badge status-${task.status}`}>{task.status}</span>
                <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                <span className={`due-date ${overdue ? 'overdue' : ''}`}>{formatDate(task.dueDate)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card projects-overview">
        <div className="card-header"><h3>Projects Overview</h3></div>
        <div className="project-overview-grid">
          {state.projects.map(project => {
            const projectTasks = state.tasks.filter(t => t.projectId === project.id);
            const done = projectTasks.filter(t => t.status === 'done').length;
            return (
              <div key={project.id} className="project-overview-card" style={{ '--accent': project.color }}
                onClick={() => { dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id }); setActiveView('board'); }}>
                <div className="poc-header">
                  <span className="poc-dot" style={{ background: project.color }} />
                  <span className="poc-name">{project.name}</span>
                  <span className={`status-badge status-${project.status}`}>{project.status}</span>
                </div>
                <div className="poc-progress-bar">
                  <div className="poc-progress-fill" style={{ width: `${project.progress}%`, background: project.color }} />
                </div>
                <div className="poc-stats">
                  <span>{done}/{projectTasks.length} tasks</span>
                  <span>{project.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
