import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { EmailDetailModal } from './components/email/EmailDetailModal';
import { AIChatDrawer } from './components/assistant/AIChatDrawer';
import { DemoControlCenterModal } from './components/demo/DemoControlCenterModal';
import { ToastNotification } from './components/notifications/ToastNotification';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { InboxPage } from './pages/InboxPage';
import { ActionsPage } from './pages/ActionsPage';
import { RelationshipsPage } from './pages/RelationshipsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

// Mobile bottom nav icons
import { LayoutDashboard, Inbox, CheckSquare, Calendar, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, setCurrentTab, setIsAssistantOpen } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inbox':
        return <InboxPage />;
      case 'actions':
        return <ActionsPage />;
      case 'relationships':
        return <RelationshipsPage />;
      case 'classroom':
        return <ClassroomPage />;
      case 'calendar':
      case 'deadlines':
        return <CalendarPage />;
      case 'connections':
        return <ConnectionsPage />;
      case 'map':
        return <CampusMapPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };


  return (
    <div className="flex h-screen bg-[#F8FAFF] overflow-hidden select-none font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating AI Assistant Trigger Bubble (Bottom-right) */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all cursor-pointer flex items-center gap-2 group"
        title="Open CampusPulse AI Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold hidden md:inline">Ask CampusPulse</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('inbox')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'inbox' ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span className="text-[10px]">Inbox</span>
        </button>

        <button
          onClick={() => setCurrentTab('actions')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'actions' ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-[10px]">Actions</span>
        </button>

        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'calendar' ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Calendar</span>
        </button>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1 text-purple-600 font-bold"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Ask AI</span>
        </button>
      </div>

      {/* Slide-in & Modal Overlays */}
      <EmailDetailModal />
      <AIChatDrawer />
      <DemoControlCenterModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
