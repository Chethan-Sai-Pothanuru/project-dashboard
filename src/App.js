import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import Modal from './components/Modal';
import { Notifications, ProjectsList, Header } from './components/Extras';
import './App.css';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const { state } = useApp();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard setActiveView={setActiveView} />;
      case 'projects': return <ProjectsList setActiveView={setActiveView} />;
      case 'board': return <KanbanBoard />;
      case 'analytics': return <Analytics />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className={`app ${state.theme}`}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <Header activeView={activeView} />
        <div className="page-content">
          {renderView()}
        </div>
      </div>
      <Modal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
