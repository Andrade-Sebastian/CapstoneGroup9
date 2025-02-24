import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam } from 'react-icons/io5'
import socket from './socket'
import axios from 'axios'
import { Divider } from '@heroui/divider'
import WaitingRoomCardComponent from '../components/WaitingRoomCardComponent'
import { IUser } from '@renderer/hooks/useSessionState'
import EmotiBitList from '../components/EmotiBitList'
import ModalComponent from '../components/ModalComponent.js'
import { useNavigate } from "react-router-dom";
export default function Summary() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigateTo = useNavigate()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Sending to Summary...')
    handleSubmit()
    handleCloseModal()
  }
  function handleSubmit() {
    console.log('in handle submit')
      navigateTo('/', {
      })
  }
  return (
    <div className="flex flex-col items-center justify-center mx-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-72">
        {/* left section */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl text-3xl font-semibold text-gray-800">End of Experiment</h1>
        </div>
      </div>
      <div className="flex gap-10 items-center justify-center">
        <button
          type="button"
          onClick={handleOpenModal}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white"
        >
          Return to HomePage
        </button>
        {/*This will redirect to Media Page */}
      </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="Return to Home"
        button="Return"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want to return to the homepage?
          </h1>
        </div>
      </ModalComponent>
    </div>
  )
}
