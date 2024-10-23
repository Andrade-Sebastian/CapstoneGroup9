import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//Routes are defined here
import{createBrowserRouter, RouterProvider } from "react-router-dom";

import HostView from './Views/HostView.tsx';
import Home from "./Views/Home.tsx"
import JoinPage from './Views/JoinPage.tsx';
import HostCreateRoom from './Views/HostCreateRoom.tsx';
import HostSelectLabPage from './Views/HostSelectLabPage.tsx';
import HostSelectMedia from './Views/SelectMedia.tsx';
import UserWaitingRoom from './Views/UserWaitingRoom.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {
        index: true, 
        element: <Home />
      },
      {
        path: "host/create",
        element: <HostCreateRoom/>
      },
      {
        path: "host/select-lab",
        element: <HostSelectLabPage/>
      },
      {
        path: "host/:room",
        element: <HostView />
      },
      {
        path: "host/select-media",
        element: <HostSelectMedia/>
      },
      {
        path: "join",
        element: <JoinPage />
      },
      {
        path: "join/user-waiting-room",
        element: <UserWaitingRoom />
      },]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
