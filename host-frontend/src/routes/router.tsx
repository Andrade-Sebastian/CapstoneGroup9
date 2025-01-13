import { createBrowserRouter } from 'react-router-dom';
import HostCreateRoom from '../Views/HostCreateRoom';
import HostSelectLabPage from '../Views/HostSelectLabPage';
import HostView from '../Views/HostView';
import SelectMedia from '../Views/SelectMedia';
import PreviouslyMadeExperiments from '../Views/PreviouslyMadeExperiments';
import ExperimentCreaterRoot from '../Views/ExperimentCreaterRoot';
import HostRoot from '../Views/HostRoot';
import React from 'react';

const router = createBrowserRouter([
    {
      path: "/",
      element: <HostCreateRoom/>,
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
      ],
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
        },
      ],
    },
  ])

export default router;
