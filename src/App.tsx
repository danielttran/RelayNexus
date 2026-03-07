import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';

function App() {
  return (
    <div className="flex flex-col h-full border-4 border-military-olive/30">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainArea />
      </main>
    </div>
  );
}

export default App;
