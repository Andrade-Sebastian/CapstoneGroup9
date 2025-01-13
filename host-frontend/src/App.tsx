import UpdateElectron from '@/components/update'
import React from 'react';
import { Outlet } from "react-router-dom"
import NavigationBar from "./components/Components/NavigationBar.tsx";


function App() {
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-gradient-to-br from-purple-700 to-blue-500">
      <NavigationBar />
      
      <div className="flex flex-col grow h-full overflow-auto">
        <Outlet />
      </div>
  </div>
  )
}

export default App
