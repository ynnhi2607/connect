import AuthPage from './pages/auth'
import OceanPage from './pages/ocean'

function App() {
  return window.location.pathname === '/auth' ? <AuthPage /> : <OceanPage />
}

export default App
