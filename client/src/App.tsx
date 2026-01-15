import { Sidebar } from './features/layout/presentation/component/Sidebar';
import { Home } from './features/home/pages/home';
function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
        <Home />
      </main>
    </div>
  );
}

export default App;