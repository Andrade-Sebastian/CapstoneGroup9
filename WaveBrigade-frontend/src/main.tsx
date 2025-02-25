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
import About from './Views/About.tsx';
import React from 'react';



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
        path: "about",
        element: <About />
      },
      {
        path: "join",
        element: <JoinPage />
      },
      {
        path: "connect-emotibit",
        element: <ConnectEmotiBit />
      },
      {
        path: "waiting-room",
        element: <WaitingRoom />
      },
      {
        path:"active-experiment",
        element: <ActiveExperiment />
      },
  ]
      
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
