import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import './index.css';
import App from "./App";
import { createBrowserRouter } from "react-router-dom";
import HostView from "./Views/HostView";
import HostCreateRoom from "./Views/HostCreateRoom";
import SelectMedia from "./Views/SelectMedia";
import HostSelectLabPage from './Views/HostSelectLabPage';
import HostRoot from './Views/HostRoot';
import ExperimentCreaterRoot from './Views/ExperimentCreaterRoot';
import PreviouslyMadeExperiments from './Views/PreviouslyMadeExperiments';
import PhotoLab from './Views/PhotoLab';
import VideoLab from './Views/VideoLab';
import GalleryLab from './Views/GalleryLab';

// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'
// //Routes are defined here
// import{createBrowserRouter, RouterProvider } from "react-router-dom";

// import HostView from './Views/HostView.tsx';
// import Home from "./Views/Home.tsx"
// import JoinPage from './Views/JoinPage.tsx';
// import HostCreateRoom from './Views/HostCreateRoom.tsx';
// import SelectMedia from './Views/SelectMedia.tsx';
// import WaitingRoom from './Views/WaitingRoom.tsx';
// import Carousel from 'react-bootstrap/Carousel';
// import ExampleCarouselImage from 'components/ExampleCarouselImage';
// import ConnectEmotiBit from './Views/ConnectEmotiBit.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {
        index: true, 
        element: <HostCreateRoom/> //Example/Placeholder
      },
      {
        path: "host",
          element: <HostRoot/>,
          children: [
            {
              path: "create",
              element: <HostCreateRoom/>,
            },
            {
              path: "select-lab",
              element: <HostSelectLabPage/>,
            },
            {
              path: ":room",
              element: <HostView/>,
            },
            {
              path: "select-media",
              element: <SelectMedia/>,
            },
            {
              path: "photo-lab",
              element: <PhotoLab/>,
            },
            {
              path: "video-lab",
              element: <VideoLab/>,
            },
            {
              path: "gallery-lab",
              element: <GalleryLab/>
            }
          ]
      },
      {
        path:"activity/:sessionId/:userId",
        element: <div>"Hello World"</div>
      }
   


    ]
    

    
  },
  // {
  //   path:"/activity",
  //   element: <ActivityRoot/>,
  //   children: [
  //     {

  //     }]

  // }
  // {
  //   path: "host",
  //     element: <HostRoot/>,
  //     children: [
  //       {
  //         path: "create",
  //         element: <HostCreateRoom/>,
  //       },
  //       {
  //         path: "select-lab",
  //         element: <HostSelectLabPage/>,
  //       },
  //       {
  //         path: ":room",
  //         element: <HostView/>,
  //       },
  //       {
  //         path: "select-media",
  //         element: <SelectMedia/>,
  //       },
  //       {
  //         path: "photo-lab",
  //         element: <PhotoLab/>,
  //       },
  //       {
  //         path: "video-lab",
  //         element: <VideoLab/>,
  //       },
  //       {
  //         path: "gallery-lab",
  //         element: <GalleryLab/>
  //       }
  //     ]
  // },
  {
          path: "create-lab",
          element: <ExperimentCreaterRoot/>,
          children: [
            {
              path: "select-lab",
              element: <HostSelectLabPage/>,
            },
            {
              index: true,
              element: <PreviouslyMadeExperiments/>,
            }]
    }])


//  {
//       path: "/",
//       element: <HostCreateRoom/>,
//     },
//     {
//       path: "host",
//       element: <HostRoot/>,
//       children: [
//         {
//           path: "create",
//           element: <HostCreateRoom/>,
//         },
//         {
//           path: "select-lab",
//           element: <HostSelectLabPage/>,
//         },
//         {
//           path: ":room",
//           element: <HostView/>,
//         },
//         {
//           path: "select-media",
//           element: <SelectMedia/>,
//         },
//       ],
//     },
//     {
//       path: "create-lab",
//       element: <ExperimentCreaterRoot/>,
//       children: [
//         {
//           path: "select-lab",
//           element: <HostSelectLabPage/>,
//         },
//         {
//           index: true,
//           element: <PreviouslyMadeExperiments/>,
//         },
//       ],
//     },

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

//OLD CODE


// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>,
// )

