import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam } from 'react-icons/io5'
import { PiCrownSimpleThin } from 'react-icons/pi'
import { HiOutlineSignal } from 'react-icons/hi2'
import { CiUser } from 'react-icons/ci'
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
import React from 'react'
import useBrainflowManager from '../hooks/useBrainflowManager.ts'
import { io } from 'socket.io-client'

export default function ActivityHost() {
  const {
    sessionId,
    hostName,
    users: emotiBits,
    roomCode,
    experimentType,
    experimentTypeString,
    setExperimentTypeString,
    setSessionId,
    setUsers,
    users,
    addUser,
    devices,
    removeUser,
    addDevice,
    removeDevice,
    videoLabSource,
    photoLabImageSource,
    experimentTitle,
    experimentDesc
  } = useSessionStore()
  const { handleHostEndSession } = useBrainflowManager()
  const [nicknames, setNickNames] = useState<string[]>([])
  const [sessionID, setSessionID] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [IPAddress, setIPAddress] = useState('')
  const [isModalUserOptionsOpen, setIsModalUserOptionsOpen] = useState(false)
  const [selectedEmotiBitId, setSelectedEmotiBitId] = useState<string | null>(null)
  const [userObjects, setUserObjects] = useState<Array<IUser>>([])
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
  const ipc = window.api

  //Add EmotiBit Modal
  const handleOpenModalUserOptions = () => setIsModalUserOptionsOpen(true)
  const handleCloseModalUserOptions = () => setIsModalUserOptionsOpen(false)
  const handleUserOptions = () => {
    handleCloseModalUserOptions()
  }

  const handleUserKick = () => {
    //insert socket logic to kick user here
    console.log('Kicking user...')
  }
  const handleViewUser = (userId, experimentType) => {
    ipc.send('activity:viewUser', sessionId, userId, experimentType)
  }

  function handleSubmit() {
    handleHostEndSession() //process destruction for all users
    console.log('in handle submit')

    socket.emit('end-experiment')
    setTimeout(() => {
      //-----HARDCODED FOR TESTING-------
      navigateTo('/summary')
    }, 2000)
  }

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
    if (!useSessionStore.getState().sessionId) return

    setSessionID(useSessionStore.getState().sessionId)
    const fetchUsers = async () => {
      try {
        console.log('Trying to get users from session ' + sessionID)
        const response = await axios.get(`http://localhost:3000/joiner/room-users/${sessionID}`)
        const users = response.data.users //Array of IUser objects

        const nicknames = [] //holds only the nicknames of those IUser Objects

        setNickNames(nicknames)

        setUserObjects(response.data.users)

        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          nicknames.push(users[i].nickname)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 5000) // Refresh users every 5 seconds

    return () => clearInterval(interval)
  }, [sessionID]) //Don't fetch any data until sessionID is set

  useEffect(() => {
    if (experimentType === 1) {
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (experimentType === 2) {
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (experimentType === 3) {
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else {
      console.log('Invalid experiment ID')
    }
  }, [experimentType])

  return (
    <div className="flex flex-col w-full px-8 pt-6">
      <Toaster position="top-right" />
      <div className="flex flex-row md:flex-no-wrap items-start justify-between">
        {/* left section */}
        <div className=" w-full space-y-4 md:w-1/3 min-w-0">
          <p className="text-6xl font-medium text-[#894DD6]">{roomCode}</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-lg">
              <PiCrownSimpleThin size={24} />
              <span className="font-semibold text-[#894DD6] "> NICKNAME </span>{' '}
              <span>{hostName}</span>
            </div>
            <div className="flex items-center space-x-2 text-lg">
              <HiOutlineSignal size={24} />
              <p className="text-lg">
                <span className="font-semibold text-[#894DD6]">SOCKET</span> A93KFN2/SJPP2RK401
              </p>
            </div>
            <div className="flex items-center space-x-2 text-lg">
              <CiUser size={24} />
              <p className="text-lg">
                <span className="font-semibold text-[#894DD6]">PARTICIPANTS</span>{' '}
                <span>{nicknames.length}</span>
              </p>
            </div>
            <div className="flex flex-col items-start mt-8 gap-2 max-w-[400px] bg-white ">
              <h1 className='text-lg font-bold'> Experiment Description</h1>
              <div className="flex items-center px-3 py-1 rounded-full bg-[#894DD6] text-white">
                <div className="text-sm">{experimentIcon}</div>
                <p className="ml-2 text-sm font-medium">{experimentTypeString}</p>
              </div>
              <h1 className="text-lg font-bold"> {experimentTitle}</h1>
              <p className="ml-2 text-wrap text-md text-gray-600">{experimentDesc}</p>
            </div>
          </div>
        </div>
        <Divider orientation="vertical" className="mx-1" />
        {/* <div>
                  {isConnected ? (
                    <span className="text-green-500 font-bold"> CONNECTED</span>
                  ) : (
                    <span className="text-red-500 font-bold"> NOT CONNECTED</span>
                  )}
                </div> */}
        <div className="w-full md:w-2/3 flex justify-center items-center min-w-0">
        <div className="relative flex justify-center items-center rounded-xl">
          {experimentType == 1 ? (
            <video
              src={videoLabSource}
              width="70%"
              height="auto"
              controls
              className="rounded-lg shadow-lg max-w-2xl w-[60%] md:w-[70%] lg:w-50%"
            ></video>
          ) : experimentType == 2 ? (
            <img
              src={photoLabImageSource}
              className='rounded-lg shadow-lg max-w-2xl w-[60%] md:w-[70%] lg:w-50%'
              alt="Exeriment Image"
            >
            </img>
          ) : experimentType == 3 ? (
            <div> 
              <p> 
                Gallery Lab Images here
              </p>
            </div>
          ) : (
            <div>
              <p>
                Article Lab here
              </p>
            </div>
          )}  
          </div>
        </div>
      </div>
      <Divider className="my-6" />
      <hr></hr>
      <div className="flex flex-col items-center">
        <div className="flex space-x-4 mt-2">
          {(userObjects || []).map((user, index) => (
            <button
              key={index}
              onClick={() => handleViewUser(user.userid, experimentType)}
              className="flex items-center px-6 py-2 rounded-md cursor-pointer text-lg shadow-md font-medium border bg-[#E6E6E6] hover:bg-[#CECECE]"
            >
              <p>{user.nickname}</p>
            </button>
          ))}
        </div>
        <div className="absolute bottom-2 flex space-x-6 mt-6">
          <button
            type="button"
            onClick={handleMask}
            className="mt-6 font-semibold py-3 px-6 rounded-3xl shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white transition duration-300"
          >
            Mask
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="mt-6 font-semibold py-3 px-6 rounded-3xl shadow-md transition duration-300 ease-in-out bg-[#F31260] hover:bg-red-600 text-white transition duration-300"
          >
            Stop
          </button>
          {/*This will redirect to Media Page */}
        </div>
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
        onAction={handleUserOptions}
        onAction2={handleViewUser}
        onAction3={handleUserKick}
        isOpen={isModalUserOptionsOpen}
        onCancel={handleCloseModalUserOptions}
        modalTitle="View Joiner?"
        button="View"
        button2="Kick"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">Do you want to view or kick the joiner?</h1>
        </div>
      </ModalComponent>
    </div>
  )
}
