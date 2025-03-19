import { BrowserRouter as Router } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AppRoutes } from './routes'
import './index.css'
import './styles/app-background.css'

function App() {
  return (
    <QueryProvider>
      <Router>
        <AppRoutes />
      </Router>
    </QueryProvider>
  )
}

export default App
