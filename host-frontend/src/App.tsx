import UpdateElectron from '@/components/update';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/Components/NavigationBar";
import ModalComponent from './components/Components/ModalComponent';

function App() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-white">
      <NavigationBar />
      <div className="flex flex-col grow h-full overflow-auto">
        <Outlet />
      </div>
  </div>
  )
}

export default App
