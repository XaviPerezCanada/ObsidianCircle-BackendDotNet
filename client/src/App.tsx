
// Asegúrate de importar desde la ruta correcta donde creaste el componente
import { Navbar } from './features/layout/presentation/component/Navbar';
import { AuthContainer } from './features/auth/presentation/component/AuthContainer';

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Navbar />
   
      <main style={{ padding: '20px', flex: 1, width: '100%', overflowX: 'hidden' }}>
        <h1>Main Page</h1>
        <AuthContainer />
      </main>
    </div>
  );
}

export default App;