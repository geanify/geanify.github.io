import { 
  Settings as SettingsIcon,
  Monitor,
  Bell,
  Shield,
  Server
} from 'lucide-react'

function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--neutral-text)', marginBottom: '4px' }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: 'var(--neutral)', fontSize: '1rem' }}>
          Manage your dashboard preferences and server configurations
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Appearance Settings */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(60, 64, 198, 0.1), rgba(87, 95, 207, 0.05))',
            border: '1px solid rgba(60, 64, 198, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--secondary), var(--secondary-highlight))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(60, 64, 198, 0.3)'
              }}
            >
              <Monitor size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--neutral-text)', margin: 0 }}>
              Appearance
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Dark Mode
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Use dark theme for the dashboard
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Compact View
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Reduce spacing for more content
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">Default Page</label>
              <select className="form-select" defaultValue="dashboard">
                <option value="dashboard">Dashboard</option>
                <option value="servers">Servers</option>
                <option value="players">Players</option>
              </select>
              <div style={{ fontSize: '12px', color: 'var(--neutral)', marginTop: '4px' }}>
                Page to load when opening dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 168, 1, 0.1), rgba(255, 192, 72, 0.05))',
            border: '1px solid rgba(255, 168, 1, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--warning), var(--warning-highlight))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(255, 168, 1, 0.3)'
              }}
            >
              <Bell size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--neutral-text)', margin: 0 }}>
              Notifications
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Server Alerts
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Get notified when servers go offline
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Player Alerts
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Notifications for player milestones
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Performance Alerts
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Alerts for high CPU/memory usage
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(5, 196, 107, 0.1), rgba(11, 232, 129, 0.05))',
            border: '1px solid rgba(5, 196, 107, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--success), var(--success-highlight))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(5, 196, 107, 0.3)'
              }}
            >
              <Shield size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--neutral-text)', margin: 0 }}>
              Security
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Add extra security to your account
                </div>
              </div>
              <button className="btn btn-secondary btn-small">
                Enable
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                  Auto Logout
                </div>
                <div style={{ fontSize: '14px', color: 'var(--neutral)' }}>
                  Automatically sign out after inactivity
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="form-group" style={{ maxWidth: '200px' }}>
              <label className="form-label">Session Timeout</label>
              <input 
                type="number" 
                className="form-input" 
                defaultValue="30" 
                placeholder="Minutes"
              />
              <div style={{ fontSize: '12px', color: 'var(--neutral)', marginTop: '4px' }}>
                Minutes of inactivity before logout
              </div>
            </div>
          </div>
        </div>

        {/* Server Defaults */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 59, 87, 0.1), rgba(255, 211, 42, 0.05))',
            border: '1px solid rgba(245, 59, 87, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(245, 59, 87, 0.3)'
              }}
            >
              <Server size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--neutral-text)', margin: 0 }}>
              Server Defaults
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Default Region</label>
              <select className="form-select" defaultValue="us-east">
                <option value="us-east">US East</option>
                <option value="us-west">US West</option>
                <option value="eu-west">EU West</option>
                <option value="eu-east">EU East</option>
                <option value="asia">Asia Pacific</option>
              </select>
              <div style={{ fontSize: '12px', color: 'var(--neutral)', marginTop: '4px' }}>
                Default server region for new servers
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Default Max Players</label>
                <input 
                  type="number" 
                  className="form-input" 
                  defaultValue="32" 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Default RAM (GB)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  defaultValue="4" 
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
          <button className="btn btn-secondary">
            Reset to Defaults
          </button>
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings 