import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery, TfiFile } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam } from 'react-icons/io5'
import { FaUserXmark } from "react-icons/fa6";
import socket from './socket'
import axios from 'axios'
import { Divider } from '@heroui/divider'
import WaitingRoomCardComponent from '../components/WaitingRoomCardComponent'
import { IUser } from '@renderer/hooks/useSessionState'
import EmotiBitList from '../components/EmotiBitList'
import ModalComponent from '../components/ModalComponent.js'
import { CiCircleCheck } from 'react-icons/ci'
import { error } from 'console'
import { useNavigate } from "react-router-dom";
import React from 'react';
import { toNamespacedPath } from 'path';
import toast, { Toaster } from 'react-hot-toast'
import { useSessionStore } from '../store/useSessionStore.tsx'
import { session } from 'electron';


export default function WaitingRoom() {
  const navigateTo = useNavigate()
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
    experimentTitle,
    experimentDesc
  } = useSessionStore()
  const [nicknames, setNickNames] = useState<string[]>([])
  const [sessionID, setSessionID] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [IPAddress, setIPAddress] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenEmoti, setIsModalOpenEmoti] = useState(false)
  const [isModalOpenSettings, setIsModalOpenSettings] = useState(false)
  const [isModalOpenKick, setIsModalOpenKick] = useState(false)
  const [selectedEmotiBitId, setSelectedEmotiBitId] = useState<string | null>(null);
  const [socketID, setSocketID] = useState('');
  const [theUserMap, setTheUserMap] = useState(new Map());
  const [focusedUser, setFocusedUser] = useState('')
  const [experimentIcon, setExperimentIcon] = useState<JSX.Element>(
    <CiPlay1 style={{ fontSize: '20px' }} />
  )
  
  useEffect(() => {
    if (experimentType === 1) {
      setExperimentTypeString('VideoLab')
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (experimentType === 2) {
      setExperimentTypeString('PhotoLab')
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (experimentType === 3) {
      setExperimentTypeString('GalleryLab')
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else if (experimentType === 4){
      setExperimentTypeString('ArticleLab')
      setExperimentIcon(<TfiFile style={{ fontSize: '20px' }} />)
    } else {
      console.log("Invalid experiment type");
    }
  }, [experimentType])

  //Modal Handlers
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Creating lobby...')
    if(nicknames.length != 0){
      handleSubmit()
      handleCloseModal()
    }
    else{
      toast.error("Please wait for people to join");
    }
  }

  //Add EmotiBit Modals
  const handleOpenModalEmoti = () => {
    setIsModalOpenEmoti(true);

  }

  const handleCloseModalEmoti = () => {
    console.log("closing modal")
    setIsModalOpenEmoti(false);
  }
  
  // const fetchDeviceData = async (deviceID: string) =>{
  //   try{
  //     const response = await axios.get(`http://localhost:3000/database/get-device-info/${deviceID}`)
  //     const deviceID = req.body.deviceID;
  //     const joiner = req.body.user_nickname;
  //   }catch(error){
  //     console.log(error)
  //   }

  // }

  const handleConfirmEmoti = async() =>{
    if(!serialNumber.trim() || !IPAddress.trim()){
      toast.error("Please enter both a Serial Number and an IP Address");
      return
    }

    const newEmotiBit = {
        userId: `user${emotiBits.length + 1}`,
        socketId: `socket${Math.floor(Math.random() * 10000)}`,
        nickname: `Joiner ${emotiBits.length + 1}`,
        associatedDevice: {
          serialNumber: serialNumber,
          ipAddress: IPAddress
      }
    }


    console.log("devices", )

    console.log("------")
    console.log("sessionID ", sessionID)
    console.log('Trying to register device with serial number ' + serialNumber + ' and IP Address ' + IPAddress)
    console.log("socketid", sessionStorage.getItem('socketID'))

    
    await axios.post(`http://localhost:3000/host/register-device`, {
      sessionID: sessionID,
      serialNumber: serialNumber,
      ipAddress: IPAddress,
      deviceSocketID: sessionStorage.getItem('socketID')
    })


    addUser(newEmotiBit)

    console.log(users)
    setSerialNumber('');
    setIPAddress('');
    setIsModalOpenEmoti(false);
    }

  // Joined EmotiBit Settings Modal
  const handleRemoveEmoti = async() => {
    if(!selectedEmotiBitId) return;

    await axios.post(`http://localhost:3000/host/remove-device`, {
      serialNumber: serialNumber,
      ipAddress: IPAddress
    })
    
    console.log("after axios")
    console.log("removing emotibit")

    removeUser(selectedEmotiBitId);

    // setEmotiBits((prevEmotiBits) =>
    //   prevEmotiBits.filter((emotiBit) => emotiBit.userId !== selectedEmotiBitId));
    setIsModalOpenSettings(false);
  } 
  const handleOpenModalSettings = (userId: string) => {
    setSelectedEmotiBitId(userId);
    setIsModalOpenSettings(true);
  };


  const handleCloseModalSettings = () => {
    setIsModalOpenSettings(false);
    setSelectedEmotiBitId(null);
  };

  const handleRemoveUser = () => {

    console.log("Socket ID: ", socketID);
    //getUserIDfromSocketID(socketID);
    
    console.log("removing user");
    setIsModalOpenSettings(false);
    navigateTo('/joiner')
  }
  
  
  // const handleUpdate = () => {
    //   console.log("updating");
    //   setIsModalOpenSettings(false);
    // }
    
    //handleSubmit
    
    //Handling kicking a user
  const handleOpenModalKick = (e) => {
    console.log("HANDLE KICK", e.target.textContent)
    setIsModalOpenKick(true)
    setFocusedUser(e.target.textContent)

  }
    const handleCloseModalKick = () => {setIsModalOpenKick(false)}
    
    
    const handleKickUser = () => {

      const nicknameSocketID = theUserMap.get(focusedUser);
      console.log("Kicking user with socket ID: ", nicknameSocketID);
      console.log("HERE IS THE USER MAP BEFORE EMIT KICKING", theUserMap)
      if(!nicknameSocketID){
        console.log("Cannot kick user: there is no socket id found.")
        return;
      }
      console.log("Kicking user with socketID:", nicknameSocketID);

      socket.emit("kick", nicknameSocketID);
      
      console.log("Emitted kick event");
    
      setTheUserMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.delete(focusedUser);
        return newMap;
      })
    
      console.log("Updated user map:", theUserMap);
      
      console.log("Kicking user...")
    
      console.log("HERE IS THE USER MAP AFTER RESETING THE MAP", theUserMap)
      setIsModalOpenKick(false);
      
    }

  useEffect(() => {
    if (!useSessionStore.getState().sessionId) return

    setSessionID(useSessionStore.getState().sessionId)
    const fetchUsers = async () => {
      try {
        // console.log('Trying to get users from session ' + sessionID);
        const response = await axios.get(`http://localhost:3000/joiner/room-users/${sessionID}`)
        const users = response.data.users //Array of IUser objects
        console.log("Users", JSON.stringify(users))
        
        const nicknames = [] //holds only the nicknames of those IUser Objects
        const frontendSocketIDs = []
        const userMap = new Map();
        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          nicknames.push(users[i].nickname)
          frontendSocketIDs.push(users[i].frontendsocketid)
        }


        users.forEach(user => {
          userMap.set(user.nickname, user.frontendsocketid);
        });

        console.log(userMap)
        setTheUserMap(userMap);
  
        setNickNames(nicknames);
        setSocketID(socketID);
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 5000) // Refresh users every 5 seconds

    return () => clearInterval(interval)
  }, [sessionID]) //Don't fetch any data until sessionID is set

  // const handleEmptyWaitingRoom = () => {
  //   if(nicknames.length === 0){
  //     toast.error("Cannot begin experiment. There is no one in the waiting room!")
  //     return;
  //   }
  //   else{
  //     toast.success("Beginning experiment...")
  //     navigateTo('/activity-room');
  //   }
  // }
  
  const handleBackButton = () => {
    navigateTo('/host/select-lab')
  }
  
  const handleSubmit =() => {
    console.log('in handle submit')
      //-----HARDCODED FOR TESTING-------
    socket.emit("session-start");
    socket.emit("session-start-spectator")
    navigateTo('/activity-room');
  }
  
  return (
    <div className="flex flex-col items-center justify-center px-4 mx:px-8 w-full">
      <div className="flex flex-col md:flex-row items-start justify-between w-full max-w-6xl gap-8">
      <Toaster position="top-right" />
        {/* left section */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-6">Welcome to Session</h1>
          <p className="text-6xl md:text-6xl font-bold text-[#894DD6] break-words">{roomCode}</p>
          <div className="space-y-2">
            <p className="text-base md:text-lg">
              <span className="font-semibold"> NICKNAME:</span> {hostName}
            </p>
            <p className="text-base md:text-lg">
              <span className="font-semibold">PARTICIPANTS: </span>
              <span className="md:text-sm font-light">{nicknames.length}</span>
            </p>
          </div>
        </div>
        {/* right section */}
        <div className="w-full md:w-1/2 mt-6">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={experimentIcon}
            labType={experimentTypeString}
            labTitle={experimentTitle}
            description={experimentDesc}
          ></WaitingRoomCardComponent>
        </div>
        <div className="w-full flex flex-col mt-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4"> Connected EmotiBits</h2>
          <div className="flex-col gap-4 overflow-y-auto max-h-[300px] md:max-h-[400px] p-4 border rounded-md shadow-md ">
            {emotiBits.map((user) => (
              <EmotiBitList key={user.userId} user={user} isConnected={true} onAction={() => handleOpenModalSettings(user.userId)} />
            ))}
          </div>
          <button
            onClick={handleOpenModalEmoti}
            className="mt-4 bg-[#7F56D9] hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out md:w-auto"
          >
            Add EmotiBit
          </button>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex justify-center flex-wrap gap-4 space-x-8 text-lg font-medium text-gray-800">
        {nicknames.map((name, index) => (
          <button type="button" key={index} onClick={(e) => handleOpenModalKick(e)}>
          <p className='flex items-center border-black font-medium rounded-md bg-[#E6E6E6] hover:bg-[#CECECE] px-4 py-1.5 text-black font-light cursor-pointer gap-2.5' key={index}> <FaUserXmark style={{ fontSize: '20px'}}/>{name}</p>
          </button>
        ))}
      </div>
      <div className="absolute bottom-0 pb-6 flex flex-row gap-10 items-center justify-center">
        <button
          type="button"
          onClick={handleBackButton}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-gray-500 hover:bg-gray-400 text-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleOpenModal}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white"
        >
          Begin
        </button>
        {/*This will redirect to Media Page */}
      </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="Begin Experiment"
        button="Begin"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want to begin the experiment?
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
        // onAction3={handleUpdate}
        isOpen={isModalOpenSettings}
        onCancel={handleCloseModalSettings}
        modalTitle="EmotiBit Settings"
        button="Remove EmotiBit"
        button2="Remove User"
        // button3="Update"
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
        onAction={handleKickUser}
        isOpen={isModalOpenKick}
        onCancel={handleCloseModalKick}
        modalTitle="Kick this Joiner?"
        button="Remove Joiner"
        >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want to kick this joiner?
          </h1>
        </div>
        </ModalComponent>
    </div>
  )
}
