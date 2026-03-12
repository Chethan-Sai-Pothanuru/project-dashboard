import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Clock, AlertCircle, Filter, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { filterTasks, formatDate, isOverdue, getPriorityColor, getAvatarColor, getInitials } from '../utils/helpers';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280' },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review', label: 'Review', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#10b981' },
];

function TaskCard({ task, index, project, onClick }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onClick(task)}
        >
          <div className="tc-header">
            <div className="tc-tags">
              {task.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="tc-tag">{tag}</span>
              ))}
            </div>
            <span className="tc-priority" style={{ color: getPriorityColor(task.priority) }}>
              ●
            </span>
          </div>
          <h4 className="tc-title">{task.title}</h4>
          {task.description && <p className="tc-desc">{task.description}</p>}
          <div className="tc-footer">
            <div className="tc-assignee" style={{ background: getAvatarColor(task.assignee) }} title={task.assignee}>
              {getInitials(task.assignee)}
            </div>
            <div className={`tc-due ${overdue ? 'overdue' : ''}`}>
              {overdue ? <AlertCircle size={11} /> : <Clock size={11} />}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
          {project && (
            <div className="tc-project-bar" style={{ background: project.color }} />
          )}
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard() {
  const { state, dispatch, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const activeProject = state.projects.find(p => p.id === state.activeProject);
  const projectTasks = useMemo(() => {
    const base = state.activeProject
      ? state.tasks.filter(t => t.projectId === state.activeProject)
      : state.tasks;
    return filterTasks(base, { search: searchTerm, priority: priorityFilter, assignee: 'all' });
  }, [state.tasks, state.activeProject, searchTerm, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    const map = {};
    COLUMNS.forEach(c => { map[c.id] = []; });
    projectTasks.forEach(t => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [projectTasks]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    dispatch({ type: 'MOVE_TASK', payload: { taskId: draggableId, newStatus } });
    addNotification(`Task moved to "${COLUMNS.find(c => c.id === newStatus)?.label}"`, 'info');
  };

  return (
    <div className="kanban-page">
      <div className="page-header">
        <div>
          <h1>{activeProject ? activeProject.name : 'All Tasks'}</h1>
          {activeProject && <p className="page-subtitle">{activeProject.description}</p>}
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null })}>
            All Projects
          </button>
          <button className="btn-primary" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'add-task' } })}>
            + Add Task
          </button>
        </div>
      </div>

      <div className="kanban-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={14} />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {activeProject && (
          <div className="progress-pill">
            <div className="progress-pill-fill" style={{ width: `${activeProject.progress}%`, background: activeProject.color }} />
            <span>{activeProject.progress}% complete</span>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const tasks = tasksByStatus[col.id] || [];
            return (
              <div key={col.id} className="kanban-column">
                <div className="column-header">
                  <div className="column-title">
                    <span className="column-dot" style={{ background: col.color }} />
                    <span>{col.label}</span>
                    <span className="column-count">{tasks.length}</span>
                  </div>
                  <button className="col-add-btn" onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'add-task', defaultStatus: col.id } })}>
                    <Plus size={14} />
                  </button>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                    >
                      {tasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          project={state.projects.find(p => p.id === task.projectId)}
                          onClick={(t) => dispatch({ type: 'SET_MODAL', payload: { type: 'task-detail', task: t } })}
                        />
                      ))}
                      {provided.placeholder}
                      {tasks.length === 0 && (
                        <div className="empty-column">Drop tasks here</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
