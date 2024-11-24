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
        path: "host",
        element: <HostRoot/>,
        children:[{
          path: "create",
          element: <HostCreateRoom/>
        },
        {
          path: "select-lab",
          element: <HostSelectLabPage/>
        },
        {
          path: ":room",
          element: <HostView />
        },
        {
          path: "select-media",
          element: <SelectMedia/>
        },
    ]
      },
      {
        path: "create-lab",
        element: <ExperimentCreaterRoot />,
        children: [{
              path: "select-lab",
              element: <HostSelectLabPage /> 
        },
        {
          index: true,
          element: <PreviouslyMadeExperiments />
        }]
          
      },
      {
        path: "join",
        element: <JoinPage />
      },
      {
        path: "waiting-room",
        element: <WaitingRoom />
      },
    
  ]
      
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
