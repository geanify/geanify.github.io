import { useState } from 'react'
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { 
  Gamepad2, 
  Server, 
  Users, 
  BarChart3,
  Settings,
  Bell,
  Menu
} from 'lucide-react'
import './dashboard.css'

// Import page components
import Dashboard from './components/Dashboard'
import Servers from './components/Servers'
import Players from './components/Players'
import SettingsPage from './components/Settings'

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/servers', label: 'Servers', icon: Server },
    { path: '/players', label: 'Players', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div className={`sidebar ${isOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Gamepad2 size={20} color="white" />
        </div>
        <div className="brand-text">GameServers Pro</div>
      </div>
      
      <nav>
        <ul className="nav-menu">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path} className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation(item.path)
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function Header({ onMenuClick }) {
  return (
    <div className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="header-title">
          <Gamepad2 size={24} />
          Gaming Dashboard
        </h1>
      </div>
      
      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="avatar">GP</div>
      </div>
    </div>
  )
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />
        
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/players" element={<Players />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
      
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <MemoryRouter>
      <AppContent />
    </MemoryRouter>
  )
}

export default App
