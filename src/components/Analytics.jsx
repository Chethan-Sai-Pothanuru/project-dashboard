import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, PieChart, Pie } from 'recharts';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { ChartTooltip } from './ChartTooltip';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

export default function Analytics() {
  const { state } = useApp();

  const tasksByProject = useMemo(() =>
    state.projects.map(p => {
      const tasks = state.tasks.filter(t => t.projectId === p.id);
      return {
        name: p.name.split(' ')[0],
        total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        color: p.color,
      };
    }), [state.projects, state.tasks]);

  const priorityData = useMemo(() => {
    const priorities = ['high', 'medium', 'low'];
    return priorities.map(p => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      value: state.tasks.filter(t => t.priority === p).length,
    }));
  }, [state.tasks]);

  const activityLast14 = useMemo(() =>
    state.activityData.slice(-14).map(d => ({
      ...d,
      date: format(parseISO(d.date), 'MMM d'),
    })), [state.activityData]);

  const radarData = useMemo(() =>
    state.projects.map(p => {
      const tasks = state.tasks.filter(t => t.projectId === p.id);
      return {
        project: p.name.split(' ')[0],
        completion: p.progress,
        tasks: tasks.length * 10,
        overdue: tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length * 20,
      };
    }), [state.projects, state.tasks]);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-subtitle">Performance metrics and project insights</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card analytics-card span-2">
          <div className="card-header"><h3>Tasks by Project</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByProject} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                {tasksByProject.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.4} />)}
              </Bar>
              <Bar dataKey="done" name="Done" radius={[4, 4, 0, 0]}>
                {tasksByProject.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card analytics-card">
          <div className="card-header"><h3>Priority Distribution</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {priorityData.map((_, i) => <Cell key={i} fill={['#ef4444', '#f59e0b', '#10b981'][i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card analytics-card span-2">
          <div className="card-header"><h3>Daily Activity Trend</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activityLast14} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={false} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card analytics-card">
          <div className="card-header"><h3>Project Radar</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="project" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Radar name="Completion" dataKey="completion" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Radar name="Tasks" dataKey="tasks" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card analytics-card">
          <div className="card-header"><h3>Project Progress</h3></div>
          <div className="progress-list">
            {state.projects.map(p => (
              <div key={p.id} className="progress-item">
                <div className="pi-header">
                  <span className="pi-name">{p.name}</span>
                  <span className="pi-pct">{p.progress}%</span>
                </div>
                <div className="pi-bar">
                  <div className="pi-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
