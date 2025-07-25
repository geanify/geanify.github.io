import { useState } from 'react'
import { 
  Server, 
  Users, 
  BarChart3,
  Gamepad2
} from 'lucide-react'

function Dashboard() {
  const [stats] = useState({
    totalServers: 1247,
    onlineServers: 1198,
    totalPlayers: 15432,
    uptime: 99.97
  })

  const gameServerData = [
    { name: 'Epic Survival', game: 'Minecraft', players: 45, maxPlayers: 100, status: 'online' },
    { name: 'Dust2 24/7', game: 'CS 1.6', players: 32, maxPlayers: 32, status: 'online' },
    { name: 'TF2 Community', game: 'TF2', players: 0, maxPlayers: 24, status: 'maintenance' }
  ]

  const getGameColor = (game) => {
    switch (game) {
      case 'Minecraft': return { color: 'var(--success)', gradient: 'linear-gradient(135deg, var(--success), var(--success-highlight))' }
      case 'CS 1.6': return { color: 'var(--warning)', gradient: 'linear-gradient(135deg, var(--warning), var(--warning-highlight))' }
      case 'TF2': return { color: 'var(--primary)', gradient: 'linear-gradient(135deg, var(--primary), var(--primary-highlight))' }
      default: return { color: 'var(--secondary)', gradient: 'linear-gradient(135deg, var(--secondary), var(--secondary-highlight))' }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--neutral-text)', marginBottom: '8px' }}>
          🎮 Gaming Dashboard
        </h1>
        <p style={{ color: 'var(--neutral)', fontSize: '1.125rem' }}>
          Welcome back! Here's an overview of your gaming servers.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(60, 64, 198, 0.1), rgba(87, 95, 207, 0.05))' }}>
          <div className="stat-info">
            <h3>Total Servers</h3>
            <div className="value" style={{ color: 'var(--neutral-text)' }}>
              {stats.totalServers.toLocaleString()}
            </div>
          </div>
          <div 
            className="stat-icon" 
            style={{ background: 'linear-gradient(135deg, var(--secondary), var(--secondary-highlight))' }}
          >
            <Server size={24} color="white" />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(5, 196, 107, 0.1), rgba(11, 232, 129, 0.05))' }}>
          <div className="stat-info">
            <h3>Online Servers</h3>
            <div className="value text-success">
              {stats.onlineServers.toLocaleString()}
            </div>
          </div>
          <div 
            className="stat-icon" 
            style={{ background: 'linear-gradient(135deg, var(--success), var(--success-highlight))' }}
          >
            <BarChart3 size={24} color="white" />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(255, 168, 1, 0.1), rgba(255, 192, 72, 0.05))' }}>
          <div className="stat-info">
            <h3>Active Players</h3>
            <div className="value text-warning">
              {stats.totalPlayers.toLocaleString()}
            </div>
          </div>
          <div 
            className="stat-icon" 
            style={{ background: 'linear-gradient(135deg, var(--warning), var(--warning-highlight))' }}
          >
            <Users size={24} color="white" />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 59, 87, 0.1), rgba(255, 211, 42, 0.05))' }}>
          <div className="stat-info">
            <h3>Uptime</h3>
            <div className="value" style={{ color: 'var(--accent)' }}>
              {stats.uptime}%
            </div>
          </div>
          <div 
            className="stat-icon" 
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Gamepad2 size={24} color="white" />
          </div>
        </div>
      </div>

      {/* Server Status */}
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--neutral-text)', marginBottom: '24px' }}>
          🚀 Recent Game Servers
        </h2>
        <div className="server-list">
          {gameServerData.map((server, index) => {
            const gameStyle = getGameColor(server.game)
            const percentage = (server.players / server.maxPlayers) * 100
            
            return (
              <div 
                key={index} 
                className="server-card"
                style={{ 
                  background: `linear-gradient(135deg, ${gameStyle.color}20, rgba(255, 255, 255, 0.02))`,
                  borderColor: gameStyle.color + '40'
                }}
              >
                <div className="server-info">
                  <div 
                    className="server-icon"
                    style={{ background: gameStyle.gradient }}
                  >
                    <Gamepad2 size={20} color="white" />
                  </div>
                  <div className="server-details">
                    <h4>{server.name}</h4>
                    <p>{server.game}</p>
                  </div>
                </div>
                
                <div className="server-status">
                  <span className={`badge ${server.status}`}>
                    {server.status}
                  </span>
                  <span style={{ color: 'var(--neutral)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {server.players}/{server.maxPlayers} players
                  </span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${percentage}%`,
                        background: gameStyle.gradient
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 