import { useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { LuSquareStack } from 'react-icons/lu'
import { BsChatSquareText } from 'react-icons/bs'
import { IoVideocam, IoNewspaper } from 'react-icons/io5'
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
import ReactPlayer from 'react-player'
import GalleryComponent from '../components/GalleryComponent.tsx'
import ChatFooter from '../components/ChatFooter.tsx'
import ChatBody from '../components/ChatBody.tsx'


export default function ActivityHost() {
  const {
    sessionId,
    hostName,
    roomCode,
    experimentType,
    experimentTypeString,
    toggleUserMask,
    videoLabSource,
    videoID,
    articleURL,
    articleLabSource,
    photoLabImageSource,
    experimentTitle,
    experimentDesc,
    galleryPhotos
  } = useSessionStore()
  const { handleHostEndSession } = useBrainflowManager()
  const [nicknames, setNickNames] = useState<string[]>([])
  const [sessionID, setSessionID] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [isMasked, setIsMasked] = useState(false)
  const [isModalOpenKick, setIsModalOpenKick] = useState(false)
  const [activeTab, setActiveTab] = useState('images')
  const [theUserMap, setTheUserMap] = useState(new Map())
  const [focusedUser, setFocusedUser] = useState('')
  const [currentDevices, setCurrentDevices] = useState<IUser[]>([])
  const [IPAddress, setIPAddress] = useState('')
  const [isModalUserOptionsOpen, setIsModalUserOptionsOpen] = useState(false)
  const [selectedEmotiBitId, setSelectedEmotiBitId] = useState<string | null>(null)
  const [isMediaAFile, setIsMediaAFile] = useState(false)
  const [userObjects, setUserObjects] = useState<
    Array<{
      device: number
      deviceId: number
      deviceSocketId: string
      frontendSocketId: string
      ipAddress: string
      isAvailable: boolean
      isConnected: boolean
      isMasked: boolean
      leftSession: null
      nickname: string
      samplingFrequency: number
      secret: string
      serialNumber: string
      sessionId: number
      userId: string
      userRole: string
    }>
  >([])
  const navigateTo = useNavigate()
  const [experimentIcon, setExperimentIcon] = useState<JSX.Element>(
    <CiPlay1 style={{ fontSize: '20px' }} />
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef(null)

  const [latestSeekTime, setLatestSeekTime] = useState(0)
  const handleMaskAll = () => {
    //Mask all button
    const newMaskState = !isMasked
    console.log('Toggling mask for ALL joiners')
    socket.emit('toggle-mask')
    setIsMasked(newMaskState)
  }
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

  //Handling kicking a user
  const handleOpenModalKick = (e) => {
    console.log('HANDLE KICK', e.target.closest('button').querySelector('p').textContent)
    setIsModalOpenKick(true)
    setFocusedUser(e.target.closest('button').querySelector('p').textContent.trim())
  }
  const handleCloseModalKick = () => {
    setIsModalOpenKick(false)
  }

  const handleKickUser = async () => {
    console.log('focused user in handleKickUser():', focusedUser)
    console.log('!!ATTEMPTING TO KICK USER!!')
    if (!focusedUser) {
      console.log('No user selected for kicking.')
      return
    }
    console.log('User Map at Kick Time:', theUserMap)
    console.log('Focused User at Kick Time:', focusedUser)
    // const nicknameSocketID = theUserMap.get(focusedUser);
    // console.log("Kicking user with socket ID: ", nicknameSocketID);
    console.log('HERE IS THE USER MAP BEFORE EMIT KICKING', theUserMap)

    let nicknameSocketID = ''

    if (focusedUser.includes(' (Spectator)')) {
      // Remove "(Spectator)" from the string
      const userFocused = focusedUser.replace(' (Spectator)', '').trim()
      setFocusedUser(focusedUser.replace(' (Spectator)', '').trim())
      console.log('in IF')
      nicknameSocketID = theUserMap.get(userFocused.replace('(Spectator)', '').trim())

      if (!nicknameSocketID) {
        console.log('Cannot kick SPECTATOR: there is no socket id found.', userFocused)
        return
      } else {
        console.log('Kicking user with socketID:', nicknameSocketID)

        console.log('Emitted kick event')
      }

      console.log(
        `<<HOST 389>>trying to kick spectator , sending sessionID ${sessionId} and socketID ${nicknameSocketID}`
      )

      axios.post(`http://${import.meta.env.VITE_BACKEND_PATH}/joiner/remove-spectator-from-session`, {
        sessionID: sessionId,
        socketID: nicknameSocketID
      })
      socket.emit('kick', nicknameSocketID)
    } else {
      nicknameSocketID = theUserMap.get(focusedUser)
      if (!nicknameSocketID) {
        console.log('Cannot kick JOINER: there is no socket id found.', focusedUser)
        return
      } else {
        console.log('Kicking user with socketID:', nicknameSocketID)

        socket.emit('kick', nicknameSocketID)

        console.log('Emitted kick event')
      }
    }

    console.log('User Map at Kick Time:', theUserMap)
    console.log('Focused User at Kick Time:', focusedUser)

    if (!nicknameSocketID) {
      console.log('Cannot kick user: there is no socket id found.', focusedUser)
      return
    }

    setTheUserMap((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.delete(focusedUser)
      return newMap
    })
    console.log('Here is the usermap after kicking', theUserMap)

    setCurrentDevices((currentDevices) => {
      const newState = currentDevices.map((device) => {
        if (device.nickname === focusedUser) {
          return {
            ...device,
            socketId: null,
            nickname: null,
            associatedDevice: device.associatedDevice
              ? {
                  ...device.associatedDevice,
                  isConnected: false
                }
              : null
          }
        }
        return device
      })

      console.log('React state after kick:', newState) // Logs the correct state before updating
      return newState
    })

    setIsModalOpenKick(false)
  }

  const handleViewUser = (e, userId, userrole, experimentType, nickname) => {
    if (userrole !== 'spectator') {
      ipc.send('activity:viewUser', sessionId, String(userId), experimentType)
    } else {
      setFocusedUser(nickname)
      handleOpenModalKick(e)
    }
  }

  function handleSubmit() {
    handleHostEndSession() //process destruction for all users
    console.log('in handle submit')

    socket.emit('end-experiment')
    setTimeout(() => {
      navigateTo('/summary')
    }, 2000)
  }

  const checkVideoMediaType = () => {
    console.log(
      'Check Video media is running... HERE ARE THE VALUES videolabsource ',
      videoLabSource,
      'hereis videoID',
      videoID
    )
    if (videoLabSource && videoLabSource.trim() !== '') {
      console.log('Detected video as a file')
      setIsMediaAFile(true)
      return
    }
    if (videoID && videoID.trim() !== '') {
      console.log('Detected video as a YouTube link.')
      setIsMediaAFile(false)
      return
    }
  }

  const checkArticleMediaType = () => {
    console.log(
      'Check Article media is running... HERE ARE THE VALUES articlelabsource ',
      articleLabSource,
      'hereis videoID',
      articleURL
    )
    if (articleLabSource && articleLabSource.trim() !== '') {
      console.log('Detected article as a file')
      setIsMediaAFile(true)
      return
    }
    if (articleURL && articleURL.trim() !== '') {
      console.log('Detected article as a URL.')
      setIsMediaAFile(false)
      return
    }
  }

  useEffect(() => {
    if (!useSessionStore.getState().sessionId) return

    setSessionID(useSessionStore.getState().sessionId)
    const fetchUsers = async () => {
      try {
        console.log('Trying to get users from session ' + sessionID)
        const response = await axios.get(`http://${import.meta.env.VITE_BACKEND_PATH}/joiner/room-users/${sessionID}`)
        const users = response.data.users //Array of IUser objects
        const rawUsers = response.data.users

        const normalizedUsers = rawUsers.map((u) => ({
          device: u.device,
          deviceId: u.deviceid,
          deviceSocketId: u.devicesocketid,
          frontendSocketId: u.frontendsocketid,
          ipAddress: u.ipaddress,
          isAvailable: u.isavailable,
          isConnected: u.isconnected,
          isMasked: u.ismasked,
          leftSession: u.leftsession,
          nickname: u.nickname,
          samplingFrequency: u.samplingfrequency,
          secret: u.secret,
          serialNumber: u.serialnumber,
          sessionId: u.sessionid,
          userId: u.userid,
          userRole: u.userrole
        }))
        setUserObjects(normalizedUsers)

        const nicknames = [] //holds only the nicknames of those IUser Objects

        setNickNames(nicknames)
        console.log('Fetched users from backend:', response.data.users)

        //setUserObjects(response.data.users)

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
      console.log('ExperimentType is:', experimentType)
      checkVideoMediaType()
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (experimentType === 2) {
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (experimentType === 3) {
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else if (experimentType === 4) {
      checkArticleMediaType()
      setExperimentIcon(<IoNewspaper style={{ fontSize: '20px' }} />)
    } else {
      console.log('Invalid experiment ID')
    }
  }, [experimentType, videoLabSource, videoID])

  //Video Synchronization Logic

  const handlePlayPause = (playing) => {
    console.log('Host emitting PLAY video event:', playing)
    setIsPlaying(playing)
    socket.emit('play-video', playing)
  }

  const handleSeek = (seconds) => {
    if (seconds !== undefined) {
      console.log(`Host emitting SEEK video event: ${seconds} seconds`)
      setLatestSeekTime(seconds)
      socket.emit('seek-video', seconds)
    } else {
      console.log('Seconds is undefined', seconds)
    }
  }

  //Using manual seeking since onSeek doesn't work with YouTube videos
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime()
        if (Math.abs(currentTime - latestSeekTime) > 1) {
          //if the current time is more than 1 seconds different from latestSeek time, correction will happen
          console.log(`Seeking to: ${currentTime}`)
          setLatestSeekTime(currentTime) //make sure to update state
          handleSeek(currentTime)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [latestSeekTime])

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
              <span className="font-semibold text-[#894DD6] "> NICKNAME </span>
              <span>{hostName}</span>
            </div>
            {/* <div className="flex items-center space-x-2 text-lg">
              <HiOutlineSignal size={24} />
              <p className="text-lg">
                <span className="font-semibold text-[#894DD6]">SOCKET</span> 
              </p>
            </div> */}
            <div className="flex items-center space-x-2 text-lg">
              <CiUser size={24} />
              <p className="text-lg">
                <span className="font-semibold text-[#894DD6]">PARTICIPANTS</span>{' '}
                <span>{nicknames.length}</span>
              </p>
            </div>
            <div className="flex flex-col items-start mt-8 gap-2 max-w-[400px] bg-white ">
              <h1 className="text-lg font-bold"> Experiment Description</h1>
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
            {experimentType == 1 && isMediaAFile ? (
              <div>
                <ReactPlayer
                  ref={playerRef}
                  url={videoLabSource}
                  controls
                  playing={isPlaying}
                  onPlay={() => handlePlayPause(true)}
                  onPause={() => handlePlayPause(false)}
                  onSeek={(seconds) => {
                    console.log(`onSeek Triggered! Seeked to: ${seconds}`)
                    handleSeek(seconds)
                  }}
                  onProgress={({ playedSeconds }) => {
                    if (playerRef.current) {
                      console.log('Current Time:', playedSeconds)
                    }
                  }}
                />
              </div>
            ) : experimentType == 1 && !isMediaAFile ? (
              <div>
                <ReactPlayer
                  ref={playerRef}
                  url={`https://www.youtube.com/embed/${videoID}`}
                  controls
                  playing={isPlaying}
                  onPlay={() => handlePlayPause(true)}
                  onPause={() => handlePlayPause(false)}
                  onSeek={(seconds) => {
                    console.log(`onSeek Triggered! Seeked to: ${seconds}`)
                    handleSeek(seconds)
                  }}
                  onProgress={({ playedSeconds }) => {
                    console.log('Current Time:', playedSeconds)
                  }}
                />
              </div>
            ) : experimentType == 2 ? (
              <img
                src={photoLabImageSource}
                className="rounded-lg shadow-lg max-w-2xl w-[60%] md:w-[70%] lg:w-50%"
                alt="Exeriment Image"
              ></img>
            ) : experimentType == 3 ? (
              <div className="w-full mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center"> Uploaded Gallery</h2>
                <GalleryComponent images={galleryPhotos} />
              </div>
            ) : experimentType == 4 && isMediaAFile ? (
              // Not a huge bug but the source should be the article lab source, it's flip flopped, don't know why
              <div>
                <iframe src={articleLabSource} width="800px" height="500px"></iframe>
              </div>
            ) : experimentType == 4 && !isMediaAFile ? (
              <div>
                <iframe src={articleURL} width="800px" height="500px"></iframe>
              </div>
            ) : (
              <div>
                <p className="text-red-500">Invalid experiment type... </p>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block w-full lg:w-1/4 p-4 bg-white shadow-md rounded-lg">
          <div className="flex flex-col h-[60vh] justify-between bg-white rounded-md shadow-md">
            <ChatBody />
            <ChatFooter />
          </div>
        </div>
      </div>
      <Divider className="my-6" />
      <hr></hr>
      <div className="flex flex-col items-center">
        <div className="flex space-x-9 mt-2">
          {(userObjects || []).map((user, index) => (
            <button
              key={index}
              onClick={(e) =>
                handleViewUser(e, user.userId, user.userRole, experimentType, user.nickname)
              }
              className="flex items-center border-black font-medium rounded-md bg-[#E6E6E6] hover:bg-[#CECECE] px-4 py-1.5 text-black font-light cursor-pointer gap-2.5"
            >
              <p>{user.nickname}</p>
            </button>
          ))}
        </div>
        <div className="relative bottom-2 flex space-x-6 mt-6">
          <button
            type="button"
            onClick={handleMaskAll}
            className={`mt-6 font-semibold py-3 px-6 rounded-3xl shadow-md transition duration-300 ease-in-out text-white cursor-pointer ${
              isMasked ? 'bg-green-500 hover:bg-green-600' : 'bg-[#7F56D9] hover:bg-violet-500'
            }`}
          >
            {isMasked ? 'Unmask' : 'Mask'}
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="mt-6 font-semibold py-3 px-6 rounded-3xl shadow-md transition duration-300 ease-in-out bg-[#F31260] hover:bg-red-600 text-white cursor-pointer"
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
        // onAction3={handleUserKick}
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
      <ModalComponent
        onAction={handleKickUser}
        isOpen={isModalOpenKick}
        onCancel={handleCloseModalKick}
        modalTitle="Kick this Spectator?"
        button="Remove Spectator"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want to kick this spectator?
          </h1>
        </div>
      </ModalComponent>
    </div>
  )
}
