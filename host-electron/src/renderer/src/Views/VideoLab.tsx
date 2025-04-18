import { TbUfo } from 'react-icons/tb'
import SideComponent from '../components/SideComponent'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import socket from './socket'
import axios from 'axios'
import { useSessionStore } from '../store/useSessionStore.tsx'
import VideoInputForm from '../components/VideoInputForm.tsx'
// import ScrollAreaComponent from '../components/ScrollAreaComponent.tsx'

export default function VideoLab() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileSelected, setIsFileSelected] = useState(false)
  const { roomCode, experimentTitle, experimentDesc, experimentType, videoLabSource } =
    useSessionStore()

  useEffect(() => {
    if (videoLabSource) {
      setIsFileSelected(true)
    }
  }, [videoLabSource])

  const sendExperimentData = async (
    experimentTitle: string,
    experimentDesc: string,
    experimentId: string
  ) => {
    try {
      const response = await axios.post('http://localhost:3000/host/send-experiment', {
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
    console.log('video source', videoLabSource)
    console.log('experimentTitle', experimentTitle)
    console.log('experimentDesc', experimentDesc)
    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)
  }
  return (
    <div className="flex">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <Toaster position="top-right" />
        <SideComponent
          icon={<TbUfo style={{ fontSize: '200px' }} />}
          headingTitle="Create a Video Lab"
          description="Start creating your experiment with videos. Choose a title, write a description, and select a a video to get started"
        />
      </div>
        <VideoInputForm
          width={500}
          height={250}
          onFileSelected={setIsFileSelected}
          videoSource={JSON.stringify(videoLabSource)}
        />
      {/* <ScrollAreaComponent className='w-full h-screen p-4'>
        <div className='w-full'>
        </div>
      </ScrollAreaComponent> */}
    </div>
  )
}
