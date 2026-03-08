import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import Settings from './components/Settings';

export type AppView = 'chat' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('chat');

  return (
    <div className="flex flex-col h-full border-4 border-military-olive/30">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex flex-1 overflow-hidden">
        {currentView === 'chat' && (
          <>
            <Sidebar />
            <MainArea />
          </>
        )}
        {currentView === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}

export default App;
