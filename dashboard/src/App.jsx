import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>🎮 GameServers Pro Dashboard</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Server count: {count}
        </button>
        <p>
          Gaming server management dashboard - Build watch is working! 🚀
        </p>
      </div>
      <p className="read-the-docs">
        Welcome to the GameServers Pro admin panel
      </p>
    </>
  )
}

export default App
