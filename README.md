# 🚀 Flowspace – Project Management Dashboard

A production-grade React application featuring:

- **Kanban Board** with drag-and-drop (hello-pangea/dnd)
- **Dashboard** with real-time stats and charts (Recharts)
- **Analytics** with Area, Bar, Pie, Line, and Radar charts
- **Project Management** with CRUD operations
- **Task Management** with filtering, search, and modals
- **Dark/Light Theme** toggle
- **useReducer + Context API** for global state
- **Notifications** system
- Fully responsive design

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI Framework |
| useReducer + Context | State Management |
| @hello-pangea/dnd | Drag & Drop |
| Recharts | Data Visualization |
| Framer Motion | Animations |
| date-fns | Date Utilities |
| Lucide React | Icons |
| uuid | Unique IDs |

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Collapsible sidebar navigation
│   ├── Dashboard.jsx     # Overview with stats & charts
│   ├── KanbanBoard.jsx   # Drag & drop task board
│   ├── Analytics.jsx     # Multi-chart analytics view
│   ├── Modal.jsx         # Task/Project modals
│   └── Extras.jsx        # Header, Notifications, Projects list
├── context/
│   └── AppContext.jsx    # Global state (useReducer)
├── data/
│   └── initialData.js    # Seed data
├── utils/
│   └── helpers.js        # Utility functions
├── App.js                # Root component
└── App.css               # Global styles
```

## Features

- Click any task to open a detail/edit modal
- Drag tasks between Kanban columns
- Add new tasks and projects via modals
- Filter tasks by priority and search
- Click projects in sidebar to view their board
- Toggle dark/light mode in the header
- Delete projects and tasks
