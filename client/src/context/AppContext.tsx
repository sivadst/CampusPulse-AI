import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmailData, ActionItem, DashboardData, ToastMessage, Category, Priority } from '../types';
import { ApiService } from '../services/api';

export type NavTab = 
  | 'dashboard'
  | 'inbox'
  | 'actions'
  | 'deadlines'
  | 'calendar'
  | 'classroom'
  | 'connections'
  | 'map'
  | 'analytics'
  | 'relationships'
  | 'assistant'
  | 'settings';


interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  dashboard: DashboardData | null;
  emails: EmailData[];
  actions: ActionItem[];
  selectedEmail: EmailData | null;
  setSelectedEmail: (email: EmailData | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'time'>) => void;
  removeToast: (id: string) => void;
  isDemoControlOpen: boolean;
  setIsDemoControlOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  toggleAction: (id: string) => Promise<void>;
  simulateEmail: (scenario?: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  openEmailById: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDemoControlOpen, setIsDemoControlOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [dash, emailRes, actRes] = await Promise.all([
        ApiService.getDashboard(),
        ApiService.getEmails(),
        ApiService.getActions()
      ]);
      setDashboard(dash);
      setEmails(emailRes.emails);
      setActions(actRes.actions);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (toast: Omit<ToastMessage, 'id' | 'time'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts(prev => [newToast, ...prev.slice(0, 3)]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  };

  const toggleAction = async (id: string) => {
    // Optimistic update
    setActions(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
    await ApiService.toggleAction(id);
    refreshData();
  };

  const openEmailById = async (id: string) => {
    let email = emails.find(e => e.id === id);
    if (!email) {
      const fetched = await ApiService.getEmailById(id);
      if (fetched) email = fetched;
    }
    if (email) {
      setSelectedEmail(email);
      ApiService.markEmailRead(email.id, true);
    }
  };

  const simulateEmail = async (scenario?: string) => {
    const res = await ApiService.simulateEmail(scenario);
    if (res && res.email) {
      setEmails(prev => [res.email, ...prev]);
      addToast({
        title: `📩 ${res.email.priority}: New University Communication`,
        message: `${res.email.subject} — ${res.email.summary.slice(0, 75)}...`,
        priority: res.email.priority,
        emailId: res.email.id
      });
      refreshData();
    }
  };

  const resetDemo = async () => {
    await ApiService.resetDemo();
    addToast({
      title: "✨ Demo Reset",
      message: "The campus database has been reset to its pristine initial state.",
      priority: "LOW"
    });
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        dashboard,
        emails,
        actions,
        selectedEmail,
        setSelectedEmail,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        isDemoControlOpen,
        setIsDemoControlOpen,
        isAssistantOpen,
        setIsAssistantOpen,
        isLoading,
        refreshData,
        toggleAction,
        simulateEmail,
        resetDemo,
        openEmailById
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
