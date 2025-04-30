import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import './index.css';
import App from "./App";
import { createBrowserRouter, createHashRouter } from "react-router-dom";
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
import ArticleLab from './Views/ArticleLab';
import WaitingRoom from './Views/WaitingRoom';
import ActivityRoom from './Views/ActivityHost';
import Summary from './Views/Summary';
import ActivityHost from './Views/ActivityHost';
import ActivityStudentView from './Views/ActivityStudentView';

const routing = 
  [
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
              },
              {
                path: "article-lab",
                element: <ArticleLab/>
              },
              {
                path:"past-experiments",
                element: <PreviouslyMadeExperiments/>
              }
  
            ]
        },
        {
          path:"waiting-room",
          element: <WaitingRoom/>
        },
        {
          path:"activity-room",
          element: <ActivityRoom/>
        },
        {
          path:"summary",
          element: <Summary/>
        },
      {
        path: "/activity/:sessionId/:userId/:experimentType/",
        element: <ActivityStudentView/>,
        children:[
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
          },
          {
            path: "article-lab",
            element: <ArticleLab/>
          }
      ]
    },]
    },
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
      }]



const router = import.meta.env.MODE === 'production' ? createHashRouter(routing) : createBrowserRouter(routing)

import.meta.env.MODE !== 'production' && console.log("")
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>


);
