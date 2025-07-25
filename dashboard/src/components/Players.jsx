import { 
  Users,
  Crown,
  Shield
} from 'lucide-react'

function Players() {
  const players = [
    { id: 1, username: 'MinecraftPro42', server: 'Epic Survival', game: 'Minecraft', status: 'online', role: 'admin', playtime: '2h 34m' },
    { id: 2, username: 'FragMaster', server: 'Dust2 24/7', game: 'CS 1.6', status: 'online', role: 'player', playtime: '45m' },
    { id: 3, username: 'HeavyWeapons', server: 'TF2 Community', game: 'TF2', status: 'offline', role: 'moderator', playtime: '1h 12m' },
    { id: 4, username: 'BuilderKing', server: 'Creative World', game: 'Minecraft', status: 'online', role: 'player', playtime: '3h 8m' },
    { id: 5, username: 'SniperElite', server: 'Competitive CS', game: 'CS 1.6', status: 'away', role: 'player', playtime: '28m' }
  ]

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown size={14} style={{ color: 'var(--accent)' }} />
      case 'moderator':
        return <Shield size={14} style={{ color: 'var(--success)' }} />
      default:
        return null
    }
  }

  const getGameColor = (game) => {
    switch (game) {
      case 'Minecraft': return 'var(--success)'
      case 'CS 1.6': return 'var(--warning)'
      case 'TF2': return 'var(--primary)'
      default: return 'var(--secondary)'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--neutral-text)', marginBottom: '4px' }}>
          👥 Player Management
        </h1>
        <p style={{ color: 'var(--neutral)', fontSize: '1rem' }}>
          Monitor active players across all servers
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Game</th>
              <th>Status</th>
              <th>Role</th>
              <th>Session Time</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: `linear-gradient(135deg, ${getGameColor(player.game)}, ${getGameColor(player.game)}80)`,
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        marginBottom: '2px'
                      }}>
                        <span style={{ 
                          fontWeight: '500', 
                          color: 'var(--neutral-text)',
                          fontSize: '14px'
                        }}>
                          {player.username}
                        </span>
                        {getRoleIcon(player.role)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--neutral)'
                      }}>
                        {player.server}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: `${getGameColor(player.game)}20`,
                      color: getGameColor(player.game)
                    }}
                  >
                    {player.game}
                  </span>
                </td>
                <td>
                  <span className={`badge ${player.status}`}>
                    {player.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: player.role === 'admin' ? 'var(--accent)20' : 
                                     player.role === 'moderator' ? 'var(--success)20' : 'var(--neutral)20',
                      color: player.role === 'admin' ? 'var(--accent)' : 
                             player.role === 'moderator' ? 'var(--success)' : 'var(--neutral)',
                      border: `1px solid ${player.role === 'admin' ? 'var(--accent)40' : 
                                          player.role === 'moderator' ? 'var(--success)40' : 'var(--neutral)40'}`
                    }}
                  >
                    {player.role}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: 'var(--neutral-text)', 
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    {player.playtime}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Players 