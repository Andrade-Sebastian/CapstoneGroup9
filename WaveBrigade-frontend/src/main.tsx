import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//Routes are defined here
import{createBrowserRouter, RouterProvider } from "react-router-dom";
import HostView from './Views/HostView.tsx';
import Home from "./Views/Home.tsx"

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
        path: "host/:room",
        element: <HostView />
      },
      {
        path: "join",
        element: <p>Join</p>
      }]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
