import { useEffect, useState } from 'react'
import { PiShootingStarThin } from 'react-icons/pi'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import SideComponent from '../components/SideComponent'
import axios from 'axios'
import socket from './socket'
import PhotoInputForm from '../components/PhotoInputForm.tsx' 

export default function PhotoLab() {
  const {
    //Global state
    experimentType,
    experimentTitle,
    experimentDesc,
    setExperimentPath,
    photoLabImageSource
  } = useSessionStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caption, setCaption] = useState('')
  const [isFileSelected, setIsFileSelected] = useState(false)

  useEffect(() => {
    if (photoLabImageSource) {
      setIsFileSelected(true)
    }
  }, [photoLabImageSource])

  const sendExperimentData = async (
    experimentTitle: string,
    experimentDesc: string,
    experimentId: string
  ) => {
    try {
      const response = await axios.post(`http://${import.meta.env.VITE_BACKEND_PATH}/host/send-experiment`, {
        experimentTitle,
        experimentDesc,
        experimentId
      })
      console.log('Post response data from sendExperimentData', response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  async function handleSubmit(e) {
    console.log('image source', photoLabImageSource)
    console.log('caption', caption)
    console.log('experimentTitle', experimentTitle)
    console.log('experimentDesc', experimentDesc)

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)
  }

  return (
    <div className="flex ">
      <Toaster position="top-right" />
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<PiShootingStarThin style={{ fontSize: '200px' }} />}
          headingTitle="Create a Photo Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select a photo to get started"
        />
      </div>

      <PhotoInputForm
        width={500}
        height={250}
        onFileSelected={setIsFileSelected}
        imageSource={JSON.stringify(photoLabImageSource)}
      />
    </div>
  )
}
