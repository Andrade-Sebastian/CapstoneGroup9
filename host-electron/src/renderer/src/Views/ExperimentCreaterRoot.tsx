import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ExperimentCreaterRoot() {
  //Future: put this in the CreateLab Page
  const EXPERIMENT_LIBRARY_URL = `http://${import.meta.env.VITE_BACKEND_PATH}/experiments/`
  const [experiments, setExperiments] = useState([])

  useEffect(() => {
    fetch(EXPERIMENT_LIBRARY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
      })
      .then((data) => {
        setExperiments(data)
        console.log(data)
      })
  }, [])

  return (
    <div>
      <Outlet />
    </div>
  )
}
