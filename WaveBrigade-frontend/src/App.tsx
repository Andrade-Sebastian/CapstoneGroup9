
import './App.css'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <div className='flex flex-col h-svh bg-slate-200'>
      <nav className='bg-amber-200'>
        <p>WaveBrigade</p>
      </nav>
      <Outlet />
    </div>
  )
}

export default App
