import { PiShootingStarThin } from 'react-icons/pi'
import SideComponent from '../components/SideComponent.tsx'
import React, { useEffect, useState } from 'react'
import PhotoInput from '../components/PhotoInput.tsx'
import ModalComponent from '../components/ModalComponent.tsx'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { IUser } from '../hooks/useSessionState.tsx'
import socket from './socket'
import { useSessionStore } from '../store/useSessionStore.tsx'

export default function PhotoLab() {
  const navigateTo = useNavigate()
  const { experimentId, roomCode, setExperimentTitle, setExperimentDesc } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [experimentsTitle, setExperimentsTitle] = useState('')
  const [experimentsDesc, setExperimentsDesc] = useState('')
  const [caption, setCaption] = useState('')
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageSource, setImageSource] = useState<string | null>(null)


  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Creating lobby...')
    handleSubmit()
    handleCloseModal()
  }

  useEffect(() => {
    if(!experimentId){
      toast.error("No experiment selected.");
    }
  }, [experimentId]);

  useEffect(() => {
    if (imageSource) {
      setIsFileSelected(true)
    }
  }, [imageSource])

  async function handleSubmit() {
    //ADD TOASTS AND MODAL CONFIRMATION
    //add to database using /database/photo-lab
    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //logic for sending code to backend
      //Create the experiment before doing this

      const response = await axios.post('http://localhost:3000/database/photo-lab', {
        experimentID: experimentId,
        path: imageSource, //null
        captions: caption
      })

      if (response.status === 200) {
        console.log('!!!creating a session')
        toast.success('Lab was created successfully', { id: loadingToastId })
        const sessionResponse = await axios.post('http://localhost:3000/host/session/create', {
          selectedExperimentId: experimentId,
          roomCode: roomCode,
          hostSocketId: 'abcd123',
          startTimeStamp: null,
          isPasswordProtected: false,
          password: '',
          isSpectatorsAllowed: true,
          endTimeStamp: null
        })
        console.log('done creating session')
        console.log('navigating to waiting room', roomCode)
        setExperimentTitle(experimentsTitle)
        setExperimentDesc(experimentsDesc)
        console.log('sending out some experiment data')
        socket.emit("experiment-data", {experimentsTitle, experimentsDesc, experimentId})
        console.log('hopefully sent out some experiment data')
        //-----HARDCODED FOR TESTING-------
        setTimeout(() => {
          //-----HARDCODED FOR TESTING-------
          navigateTo('/waiting-room')
        }, 2000)
      } else {
        //Lab creation fails
        toast.error('Could not create lab, try again', { id: loadingToastId })
      }
    } catch (error) {
      console.error('Could not create lab, try again', error)
      toast.error('Could not create lab, try again', { id: loadingToastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleChange(e) {
    console.log(e.target.files)
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" />
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<PiShootingStarThin style={{ fontSize: '200px' }} />}
          headingTitle="Create a Photo Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select a photo to get started"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-3/5 p-6 min-h-[600px] space-y-6 mt-50">
      <p className="text-lg text-gray-600"> Experiment ID: {experimentId || "None"}</p>
      <p className="text-lg text-gray-600"> Room Code: {roomCode || "None"}</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="w-full">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Title for Experiment <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              id="experimentTitle"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentsTitle(e.target.value)}
              value={experimentsTitle}
              placeholder="Provide a title for your experiment"
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="experimentDesc"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Description for Experiment{' '}
            </label>
            <textarea
              id="experimentDesc"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentsDesc(e.target.value)}
              value={experimentsDesc}
              placeholder="Provide a description for your experiment"
            ></textarea>
          </div>
          <div className="w-full">
            <label htmlFor="addImage" className="block text-sm font-medium text-gray-700 mb-2">
              Add Image
              <span className="text-purple-500"> *</span>
            </label>

            <PhotoInput
              width={500}
              height={250}
              onFileSelected={setIsFileSelected}
              onSourceChange={setImageSource}
              imageSource={imageSource}
            />
          </div>

          <div className="w-full">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a Caption
              <span className="text-purple-500"> *</span>
            </label>
            <input
              type="text"
              id="caption"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setCaption(e.target.value)}
              value={caption}
            />
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!experimentsTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentsTitle.trim() && isFileSelected
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
            {/*This will redirect to Media Page */}
          </div>
        </form>
      </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        button="Create Lobby"
        modalTitle="LAB CONFIRMATION"
      >
        <div className="mb-6">
          <label htmlFor="experimentTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Title of Experiment
          </label>
          <input
            type="text"
            id="experimentTitle"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={experimentsTitle}
            onChange={(e) => setExperimentsTitle(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="experimentDesc" className="block text-sm font-medium text-gray-700 mb-2">
            Description of Experiment{' '}
          </label>
          <textarea
            id="experimentDesc"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            //   focus:outline-none focus:ring-2 focus:ring-indigo-500
            onChange={(e) => setExperimentsDesc(e.target.value)}
            value={experimentsDesc}
            disabled
          ></textarea>
        </div>
        <div className="mb-6">
          <label htmlFor="experimentImage" className="block text-md font-medium text-gray-700 mb-2">
            File Upload
          </label>
          <input
            type="text"
            id="experimentImage"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={imageSource}
            onChange={(e) => setImageSource(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="caption" className="block text-md font-medium text-gray-700 mb-2">
            Caption
          </label>
          <input
            type="text"
            id="caption"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      </ModalComponent>
    </div>
  )
}
