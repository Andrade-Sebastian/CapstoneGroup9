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
import SelectMedia from './Views/SelectMedia.tsx';
import HostRoot from './Views/HostRoot.tsx';
import WaitingRoom from './Views/WaitingRoom.tsx';
import PreviouslyMadeExperiments from './Views/PreviouslyMadeExperiments.tsx';
import ExperimentCreaterRoot from './Views/ExperimentCreaterRoot.tsx';
import Carousel from 'react-bootstrap/Carousel';
import ExampleCarouselImage from 'components/ExampleCarouselImage';
import ConnectEmotiBit from './Views/ConnectEmotiBit.tsx';
import ActiveExperiment from './Views/ActiveExperiment.tsx';
import SpectatorActiveExperiment from './Views/SpectatorActiveExperiment.tsx';
import About from './Views/About.tsx';
import React from 'react';
import EnterPassword from './Views/EnterPassword.tsx';
import PrivateRoute from './utils/PrivateRoute.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {
        index: true, 
        element: <JoinPage />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "join",
        element: <JoinPage />
      },
      {
        path: "enter-password",
        element: <PrivateRoute><EnterPassword /></PrivateRoute>
        // element: <EnterPassword/>
      },
      {
        path: "connect-emotibit",
        element: <PrivateRoute><ConnectEmotiBit /></PrivateRoute>
        // element: <ConnectEmotiBit/>
      },
      {
        path: "waiting-room",
        element: <PrivateRoute><WaitingRoom /></PrivateRoute>
        // element: <WaitingRoom/>
      },
      {
        path:"active-experiment",
        // element: <PrivateRoute><ActiveExperiment /></PrivateRoute>
        element: <ActiveExperiment/>
      },
      {
        path:"active-experiment-spectator",
        // element: <PrivateRoute><SpectatorActiveExperiment /></PrivateRoute>
        element: <SpectatorActiveExperiment/>
      },
  ]
      
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
