import { createContext, useContext, useState, useEffect } from 'react';

const UiContext = createContext();

export function UiProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto close on mobile, open on desktop
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // set initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <UiContext.Provider value={{ sidebarOpen, toggleSidebar, isMobile }}>
      {children}
    </UiContext.Provider>
  );
}

export const useUi = () => useContext(UiContext);