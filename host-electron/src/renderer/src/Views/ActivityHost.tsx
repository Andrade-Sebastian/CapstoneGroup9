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
import { CiCircleCheck } from 'react-icons/ci'
import { error } from 'console'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore.tsx'
import React from 'react';
import useBrainflowManager from '../hooks/useBrainflowManager.ts';
import { io } from 'socket.io-client'

export default function WaitingRoom() {
  const location = useLocation()
  // const { nickName, roomCode, labID, name, description, imageUrl } = location.state || {}
  const { users, roomCode, experimentId, addUser, removeUser, experimentTitle, experimentDesc, hostName } = useSessionStore(); 
  const { handleHostEndSession } = useBrainflowManager();
  const [nicknames, setNickNames] = useState<string[]>([])
  const [sessionID, setSessionID] = useState('')
  const [experimentType, setExperimentType] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [IPAddress, setIPAddress] = useState('')
  const [isModalOpenEmoti, setIsModalOpenEmoti] = useState(false)
  const [isModalOpenSettings, setIsModalOpenSettings] = useState(false)
  const [selectedEmotiBitId, setSelectedEmotiBitId] = useState<string | null>(null)
  const [emotiBits, setEmotiBits] = useState<IUser[]>(location.state?.emotiBits || [])
  const navigateTo = useNavigate()
  const [experimentIcon, setExperimentIcon] = useState<JSX.Element>(
    <CiPlay1 style={{ fontSize: '20px' }} />
  )
  const handleMask = () => toast.error('No joiner to mask')
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Sending to Summary...')
    handleSubmit()
    handleCloseModal()
  }

  //Add EmotiBit Modal
  const handleOpenModalEmoti = () => setIsModalOpenEmoti(true)
  const handleCloseModalEmoti = () => setIsModalOpenEmoti(false)
  const handleConfirmEmoti = () => {
    if (!serialNumber.trim() || !IPAddress.trim()) {
      toast.error('Please enter both a Serial Number and an IP Address')
      return
    }
    const newEmotiBit: IUser = {
      userId: `user${emotiBits.length + 1}`,
      socketId: `socket${Math.floor(Math.random() * 10000)}`,
      nickname: `Joiner ${emotiBits.length + 1}`,
      associatedDevice: {
        serialNumber: serialNumber,
        ipAddress: IPAddress
      }
    }
    setEmotiBits((prevEmotiBits) => [...prevEmotiBits, newEmotiBit])
    setSerialNumber('')
    setIPAddress('')
    setIsModalOpenEmoti(false)
  }

  // Joined EmotiBit Settings Modal
  const handleOpenModalSettings = (userId: string) => {
    setSelectedEmotiBitId(userId)
    setIsModalOpenSettings(true)
  }

  const handleCloseModalSettings = () => {
    setIsModalOpenSettings(false)
    setSelectedEmotiBitId(null)
  }

  const handleRemoveEmoti = () => {
    if (!selectedEmotiBitId) return
    setEmotiBits((prevEmotiBits) =>
      prevEmotiBits.filter((emotiBit) => emotiBit.userId !== selectedEmotiBitId)
    )
    setIsModalOpenSettings(false)
  }
  const handleRemoveUser = () => {
    console.log('removing user')
    setIsModalOpenSettings(false)
  }
  const handleUpdate = () => {
    console.log('updating')
    setIsModalOpenSettings(false)
  }

  function handleSubmit() {
    //handleHostEndSession(); //process destruction for all users 
    console.log('in handle submit')
    
    socket.emit("end-experiment")
    setTimeout(() => {
      //-----HARDCODED FOR TESTING-------
      navigateTo('/summary')
    }, 2000)
  }

  // useEffect(() => {
  //   // Emit join waiting room
  //   const userInformation = { nickName, roomCode };
  //   socket.emit("join_waiting_room", userInformation);
  //   console.log("Emitting join_waiting_room event with:", JSON.stringify(userInformation));

  //   // Listen for updates to the room's nicknames
  //   socket.on("receive_names", (names) => {
  //     if (Array.isArray(names)) {
  //       console.log("Nicknames received:", names);
  //       setNickNames(names);
  //     } else {
  //       console.error("Did not receive an array of names, received:", names);
  //     }
  //   });

  //   return () => {
  //     socket.off("receive_names");
  //   };
  // }, [nickName, roomCode]);

  useEffect(() => {
    const getSessionID = async () => {
      const response = await axios.get(`http://localhost:3000/joiner/validateRoomCode/${roomCode}`)
      if (response.status === 200) {
        setSessionID(response.data.sessionID)
      }
    }

    getSessionID()
  }, [])

  useEffect(() => {
    if (!sessionID) return

    const fetchUsers = async () => {
      try {
        console.log('Trying to get users from session ' + sessionID)
        const response = await axios.get(`http://localhost:3000/joiner/room-users/${sessionID}`)
        const users = response.data.users //Array of IUser objects

        const nicknames = [] //holds only the nicknames of those IUser Objects

        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          nicknames.push(users[i].nickname)
        }

        setNickNames(nicknames)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 5000) // Refresh users every 5 seconds

    return () => clearInterval(interval)
  }, [sessionID]) //Don't fetch any data until sessionID is set
  useEffect(() => {
    if (experimentId === '1') {
      setExperimentType('VideoLab')
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (experimentId === '2') {
      setExperimentType('PhotoLab')
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (experimentId === '3') {
      setExperimentType('GalleryLab')
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else {
      toast.error('Invalid experimentid received')
    }
  }, [experimentId])
  return (
    <div className="flex flex-col items-center justify-center mx-8">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row items-start justify-between gap-72">
        {/* left section */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl text-3xl font-semibold text-gray-800">Welcome to Session</h1>
          <p className="text-6xl font-bold text-[#894DD6]">{roomCode}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold"> NICKNAME:</span> {hostName}
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR SERIAL NUMBER:</span> A93KFN2/SJPP2RK401
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR STATUS:</span>{' '}
              <span className="text-green-500 font-bold">CONNECTED</span>
            </p>
          </div>
        </div>
        {/* right section */}
        <div className="md:w-1/2">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={experimentIcon}
            labType={experimentType}
            labTitle={experimentTitle}
            description={experimentDesc}
          ></WaitingRoomCardComponent>
        </div>
        <div className="w-full flex flex-col mt-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
            {' '}
            Connected EmotiBits
          </h2>
          <div className="flex-col gap-4 overflow-y-auto max-h-[300px] md:max-h-[400px] p-4 border rounded-md shadow-md ">
            {emotiBits.map((user) => (
              <EmotiBitList
                key={user.userId}
                user={user}
                isConnected={true}
                onAction={() => handleOpenModalSettings(user.userId)}
              />
            ))}
          </div>
          <button
            onClick={handleOpenModalEmoti}
            className="mt-4 bg-[#7F56D9] hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out md:w-auto"
          >
            Add EmotiBit
          </button>
          {/* <EmotiBitList
                   icon={<CiCircleCheck style={{ fontSize: '20px' }} />}
                   joiner="Joanna"
                   serial="AS8FD90G9DD0GD9F"
                   ip="123.456.78"
                 ></EmotiBitList> */}
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex justify-center space-x-8 text-lg font-medium text-gray-800">
        {nicknames.map((name, index) => (
          <p key={index}>{name}</p>
        ))}
      </div>
      <div className="flex gap-10 items-center justify-center">
        <button
          type="button"
          onClick={handleMask}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white"
        >
          Mask
        </button>
        <button
          type="button"
          onClick={handleOpenModal}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#F31260] hover:bg-red-600 text-white"
        >
          Stop
        </button>
        {/*This will redirect to Media Page */}
      </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="End Experiment"
        button="End"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want to end the experiment?
          </h1>
        </div>
      </ModalComponent>
      <ModalComponent
        onAction={handleConfirmEmoti}
        isOpen={isModalOpenEmoti}
        onCancel={handleCloseModalEmoti}
        modalTitle="Add an EmotiBit"
        button="Add EmotiBit"
      >
        <div className="mb-6">
          <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-2">
            IP Address
          </label>
          <input
            type="text"
            id="ipAddress"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={IPAddress}
            onChange={(e) => setIPAddress(e.target.value)}
          />
        </div>
      </ModalComponent>
      <ModalComponent
        onAction={handleRemoveEmoti}
        onAction2={handleRemoveUser}
        onAction3={handleUpdate}
        isOpen={isModalOpenSettings}
        onCancel={handleCloseModalSettings}
        modalTitle="EmotiBit Settings"
        button="Remove EmotiBit"
        button2="Remove User"
        button3="Update"
      >
        <div className="mb-6">
          <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-2">
            IP Address
          </label>
          <input
            type="text"
            id="ipAddress"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={IPAddress}
            onChange={(e) => setIPAddress(e.target.value)}
          />
        </div>
      </ModalComponent>
    </div>
  )
}
