import { 
  Server,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

function Servers() {
  const servers = [
    { id: 1, name: 'Epic Survival', game: 'Minecraft', status: 'online', players: 45, maxPlayers: 100, location: 'US East' },
    { id: 2, name: 'Dust2 24/7', game: 'CS 1.6', status: 'online', players: 32, maxPlayers: 32, location: 'EU West' },
    { id: 3, name: 'TF2 Community', game: 'TF2', status: 'maintenance', players: 0, maxPlayers: 24, location: 'US West' },
    { id: 4, name: 'Creative World', game: 'Minecraft', status: 'online', players: 18, maxPlayers: 50, location: 'Asia' },
    { id: 5, name: 'Competitive CS', game: 'CS 1.6', status: 'offline', players: 0, maxPlayers: 16, location: 'EU East' }
  ]

  const getGameIcon = (game) => {
    const gameColors = {
      'Minecraft': 'var(--success)',
      'CS 1.6': 'var(--warning)',
      'TF2': 'var(--primary)'
    }
    return gameColors[game] || 'var(--secondary)'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '0' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--neutral-text)', marginBottom: '4px' }}>
            🖥️ Server Management
          </h1>
          <p style={{ color: 'var(--neutral)', fontSize: '1rem' }}>
            Manage all your gaming servers
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Create Server
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Server</th>
              <th>Status</th>
              <th>Players</th>
              <th className="mobile-hidden">Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server) => (
              <tr key={server.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px', 
                        background: `linear-gradient(135deg, ${getGameIcon(server.game)}, ${getGameIcon(server.game)}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Server size={16} color="white" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        color: 'var(--neutral-text)',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {server.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--neutral)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {server.game}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${server.status}`}>
                    {server.status}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: 'var(--neutral-text)',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    {server.players}/{server.maxPlayers}
                  </span>
                </td>
                <td className="mobile-hidden">
                  <span style={{ 
                    color: 'var(--neutral)',
                    fontSize: '14px'
                  }}>
                    {server.location}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view" title="View Server">
                      <Eye size={14} />
                    </button>
                    <button className="action-btn edit mobile-hidden" title="Edit Server">
                      <Edit size={14} />
                    </button>
                    <button className="action-btn delete mobile-hidden" title="Delete Server">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Servers 