import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam, IoNewspaper } from 'react-icons/io5'
import { FaUserXmark } from "react-icons/fa6";
import socket from './socket'
import axios from 'axios'
import { Divider } from '@heroui/divider'
import WaitingRoomCardComponent from '../components/WaitingRoomCardComponent'
import { IUser } from '@renderer/hooks/useSessionState'
import EmotiBitList from '../components/EmotiBitList'
import ModalComponent from '../components/ModalComponent.tsx'
import { CiCircleCheck } from 'react-icons/ci'
import { count, error } from 'console'
import { useNavigate } from "react-router-dom";
import React from 'react';
import { toNamespacedPath } from 'path';
import toast, { Toaster } from 'react-hot-toast'
import { useSessionStore } from '../store/useSessionStore.tsx'
import { ipcRenderer, session } from 'electron';
import { isDeepStrictEqual } from 'util';
import { IUserInfo } from "../store/useSessionStore";
import { GalleryComponent} from "../components/GalleryComponent.tsx";
import { GiSandCastle } from "react-icons/gi";


export default function WaitingRoom() {
  const navigateTo = useNavigate()
  const {
    sessionId,
    hostName,
    users,
    roomCode,
    experimentType,
    setExperimentTitle,
    setExperimentDesc,
    experimentTypeString,
    setExperimentTypeString,
    setSessionId,
    removeDevice,
    experimentTitle,
    experimentDesc
  } = useSessionStore()
  const [ isBeginDisabled, setIsBeginDisabled] = useState(false);
  const [ isConnectEmotibitDisabled, setIsConnectEmotibitDisabled] = useState(false);
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

  const emotiBits = useSessionStore((state) => state.users);
  const setUsers = useSessionStore((state) => state.setUsers);
  //const addUser = useSessionStore ((state) => state.addUser);
  const updateDeviceInfo = useSessionStore((state) => state.updateDevice);
  const addDevice = useSessionStore((state) => state.addDevice);
  const devices = useSessionStore((state) => state.devices);
  const [currentUsers, setCurrentUsers] = useState<IUserInfo[]>([]);
  const [counter, setCounter] = useState(0);
  const [allDevicesConnected, setAllDevicesConnected] = useState(false);
  const [currentDevices, setCurrentDevices] = useState<IUser[]>([]);
  const ipc = window.api;

  useEffect(() =>{
    setTimeout(()=>{

      console.log("Sending experiment type to users");
      socket.emit("experiment-type", experimentType);
    }, 500);
  }, [])


  

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
      setExperimentIcon(<IoNewspaper style={{ fontSize: '20px' }} />)
    } else if (experimentType === 5){
      setExperimentTypeString('Sandbox')
      setExperimentIcon(<GiSandCastle style={{ fontSize: '20px' }} />)
      setExperimentTitle("Sandbox Lab")
      setExperimentDesc('Play with your EmotiBits without any media to react to!')
    } else {
      console.log("Invalid experiment type");
    }
  }, [experimentType])



  //Modal Handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsBeginDisabled(false);
    setIsConnectEmotibitDisabled(false);
    console.log(`[HandleOpenModal]Begin is ${isBeginDisabled} and ConnectEmotibitDisabled is ${isConnectEmotibitDisabled}`)
  }
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Creating lobby...')
    if(nicknames.length != 0){
      handleSubmit()
      handleCloseModal()
      setAllDevicesConnected(true);
    }
    else{
      toast.error("Please wait for people to join");
    }
  }
  const handleConnectEmotibit = async () => {
    //Insert logic here to run script...
    setIsBeginDisabled(true);
    setIsConnectEmotibitDisabled(true);
    setCounter(0);

    if(currentUsers.length > 0){
      setUsers(currentUsers);
      updateUserDevice();
      await launchProcesses();
    }
  }

  useEffect(() => {
    let isChecking = false;

    const checkDevices = async () => {
      if (isChecking || counter >= 10) {
        clearInterval(intervalId);
        return;
      }
      isChecking = true;

        try{
          const connectedDevices = await axios.get(`http://localhost:3000/host/check-connected-devices/${sessionId}`)
          if(connectedDevices.data.success){
              setAllDevicesConnected(connectedDevices.data.devices.every(device => device.isconnected));
          }
          if (allDevicesConnected) {
            clearInterval(intervalId); // Stop checking if all devices are connected
          }
        }
        catch(error){
          console.error("Error trying to start brainflow for devices");
          toast.error("There was a problem connecting devices. Please try again.");
        }

        setCounter(prev => prev += 1);
        isChecking = false;
    }

    const intervalId = setInterval(checkDevices, 2000)

    return () => clearInterval(intervalId)
    
  }, [allDevicesConnected, sessionId, counter, setAllDevicesConnected, setCounter])

  useEffect(() => {
        if(allDevicesConnected){
          console.log("All devices are connected");
          toast.success("All devices are connected!");
          setIsConnectEmotibitDisabled(true);
          setIsBeginDisabled(false);
        }
        else if (counter >= 10){
          console.log("Not all devices are connected");
          toast.error("There was a problem connecting devices. Please try again.");
          setIsConnectEmotibitDisabled(false);
          setIsBeginDisabled(true);
        }
  }, [allDevicesConnected, counter, setIsConnectEmotibitDisabled, setIsBeginDisabled])

  //loops through current users and updates their devices in Zustand
    function updateUserDevice(){
      currentUsers.forEach((user) => {
        console.log("In for each for current users: ", user);
        if(user.userrole === "joiner"){
          const userDevice = devices.find((device) => device.serialNumber === user.serialnumber);
          console.log("The user's device is: ", userDevice);
          if(userDevice){
            const updatedDevice = {
              ...userDevice,
              deviceId: user.deviceid,
              deviceSocketId: user.devicesocketid,
              isConnected: user.isconnected
            };
            console.log("Users device after update: ", updatedDevice);
            updateDeviceInfo(updatedDevice);
          }
        }
      })
    }
      

  //Add EmotiBit Modals
  const handleOpenModalEmoti = () => {
    setIsModalOpenEmoti(true);
  }

  const handleCloseModalEmoti = () => {
    console.log("closing modal")
    setIsModalOpenEmoti(false);
  }

  const handleConfirmEmoti = async () =>{
    if(!serialNumber.trim() || !IPAddress.trim()){
      toast.error("Please enter both a Serial Number and an IP Address");
      return
    }

    const emotiBits: IUser = {
        userId: `device-${serialNumber}`,
        socketId: null,
        nickname: null, 
        associatedDevice: {
          serialNumber,
          ipAddress: IPAddress,
          socketID: sessionStorage.getItem('socketID'),
          isConnected: false
        }
      };
      try{

        await axios.post(`http://localhost:3000/host/register-device`, {
          sessionID: sessionID,
          serialNumber: serialNumber,
          ipAddress: IPAddress,
          deviceSocketID: sessionStorage.getItem('socketID')
        });

        setCurrentDevices(currentDevices => [...currentDevices, emotiBits])
        addDevice({
          deviceId: null,
          serialNumber: serialNumber,
          ipAddress: IPAddress,
          deviceSocketId: null,
          isConnected: false
        })
        socket.emit("new-device-registered", emotiBits);
        toast.success("Device registered successfully");
      } catch(error){
        console.error("Error registering device:", error);
        toast.error("Failed to register device");
      }
      
          console.log("devices", )
      
          console.log("------")
          console.log("sessionID ", sessionID)
          console.log('Trying to register device with serial number ' + serialNumber + ' and IP Address ' + IPAddress)
          console.log("socketid", sessionStorage.getItem('socketID'))
      
          console.log(users)
      setSerialNumber('');
      setIPAddress('');
      setIsModalOpenEmoti(false);
    };

  // Joined EmotiBit Settings Modal
  const handleRemoveEmoti = async() => {
    if(!selectedEmotiBitId) return;

    await axios.post(`http://localhost:3000/host/remove-device`, {
      serialNumber: serialNumber,
      ipAddress: IPAddress
    })
    
    console.log("after axios")
    console.log("removing emotibit")

    const serialNumberToRemove = serialNumber;

    setCurrentDevices(currentDevices => 
      currentDevices.filter(device => device.associatedDevice.serialNumber !== serialNumberToRemove)
    );
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
  
    
  //function to start a brainflow process for each emotibit
  async function launchProcesses(){
    console.log("INSIDE LAUNCH PROCESS");
    for(let i = 0; i < currentUsers.length; i++){
      console.log("CURRENT USER PASSED INTO IPC: ", currentUsers[i]);
      ipc.send("brainflow:launch", 
        currentUsers[i].ipaddress,
        currentUsers[i].serialnumber,
        "http://localhost:3000",
        currentUsers[i].userid,
        currentUsers[i].frontendsocketid,
        currentUsers[i].sessionid
      )
    }  
  }

  //updates the device connection to true if brainflow is successful on launch
  useEffect(() => {
    const setDeviceConnection = async (event, data) => {
        const {sessionID, serialNumber, status} = data;
        console.log("IPC RECIEVE STATUS: ", status);
        if(status === "success"){
          try {
                
                await axios.post(`http://localhost:3000/host/update-device-connection`,
                {
                  serial: serialNumber,
                  socket: sessionStorage.getItem('socketID'),
                  connection: true
                }
              )
            console.log("All devices successfully updated");
          }
          catch(error){
            console.error("Failed to update device status", error);
          }
        }
      };

    const cleanUp = ipc.receive("brainflow:launched", setDeviceConnection);
      
      return () => {
        cleanUp()
      }
  }, [launchProcesses])

    //Handling kicking a user
  const handleOpenModalKick = (e) => {
    console.log("HANDLE KICK", e.target.closest('button').querySelector('p').textContent);
    setIsModalOpenKick(true)
    setFocusedUser(e.target.closest('button').querySelector('p').textContent.trim());

  };
    const handleCloseModalKick = () => {setIsModalOpenKick(false)};
    
    
    const handleKickUser = async () => {
      console.log("focused user in handleKickUser():", focusedUser)
      console.log("!!ATTEMPTING TO KICK USER!!")
      if(!focusedUser){
        console.log("No user selected for kicking.")
        return;
      }
      console.log("User Map at Kick Time:", theUserMap);
      console.log("Focused User at Kick Time:", focusedUser);
      // const nicknameSocketID = theUserMap.get(focusedUser);
      // console.log("Kicking user with socket ID: ", nicknameSocketID);
      console.log("HERE IS THE USER MAP BEFORE EMIT KICKING", theUserMap);
      

      let nicknameSocketID = "";

      if (focusedUser.includes(" (Spectator)")){
        // Remove "(Spectator)" from the string
        const userFocused = focusedUser.replace(" (Spectator)", "").trim()
        setFocusedUser(focusedUser.replace(" (Spectator)", "").trim());
        console.log("in IF")
        nicknameSocketID = theUserMap.get(userFocused.replace("(Spectator)", "").trim());
        
        if(!nicknameSocketID){
          console.log("Cannot kick SPECTATOR: there is no socket id found.", userFocused)
          return;
        }else{
          console.log("Kicking user with socketID:", nicknameSocketID);
          
          console.log("Emitted kick event");
        }
        
        console.log(`<<HOST 389>>trying to kick spectator , sending sessionID ${sessionId} and socketID ${nicknameSocketID}` )
        
        axios.post(`http://localhost:3000/joiner/remove-spectator-from-session`,
          {
            "sessionID": sessionId,
            "socketID": nicknameSocketID
          }
        )
        socket.emit("kick", nicknameSocketID);
      }else{
        nicknameSocketID = theUserMap.get(focusedUser);
        if(!nicknameSocketID){
          console.log("Cannot kick JOINER: there is no socket id found.", focusedUser)
          return;
        }else{
        console.log("Kicking user with socketID:", nicknameSocketID);

        socket.emit("kick", nicknameSocketID);
      
        console.log("Emitted kick event");
      }}
  
  
      console.log("User Map at Kick Time:", theUserMap);
      console.log("Focused User at Kick Time:", focusedUser);
  
      if(!nicknameSocketID){
        console.log("Cannot kick user: there is no socket id found.", focusedUser)
        return;
      }
    
      setTheUserMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.delete(focusedUser);
        return newMap;
      });
      console.log("Here is the usermap after kicking", theUserMap);

      setCurrentDevices(currentDevices => {
        const newState = currentDevices.map(device => {
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
            };
          }
          return device;
        });
      
        console.log("React state after kick:", newState); // Logs the correct state before updating
        return newState;
      });
    
      setIsModalOpenKick(false);
      
    };

  useEffect(() => {
    console.log("Component re-rendered, emotibits,", emotiBits);
  }, [emotiBits]);

  useEffect(() => {
    socket.on("joiner-connected", async ({ socketID, nickname, lastFourSerial }) => {
      console.log(`Joiner Connected Event received: Joiner-${nickname}, SocketID-${socketID}, Last Four of Serial ${lastFourSerial}`);
      try{

        setCurrentDevices(currentDevices => {
          const newState = currentDevices.map(device => {
            if (device.associatedDevice && device.associatedDevice.serialNumber === lastFourSerial) {
              return { 
                ...device, 
                socketId: socketID,
                nickname: nickname,
                associatedDevice: device.associatedDevice
                ? { 
                  ...device.associatedDevice, 
                  isConnected: true 
                } : null
              }
            }
            return device;
          });
        
          console.log("React state after new joiner:", newState); // Logs the correct state before updating
          return newState;
        });

        setTheUserMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(nickname, socketID);
          return newMap;
        });
        console.log("Updated usermap.. ", useSessionStore.getState().users);

        toast.success(`${nickname} connected to EmotiBit ${lastFourSerial}`);
      } catch(error){
        console.error("Error fetching device data:", error);
        toast.error("Error fetching device data:");

      }
    });
    return () => {
      socket.off("joiner-connected");
    };
  }, [setUsers, setTheUserMap, setCurrentDevices, currentDevices]);

  useEffect(() => {
    if (!useSessionStore.getState().sessionId) return

    setSessionID(useSessionStore.getState().sessionId)
    const fetchUsers = async () => {
      try {
        // console.log('Trying to get users from session ' + sessionID);
        const response = await axios.get(`http://localhost:3000/joiner/room-users/${sessionID}`)
        const users = response.data.users //Array of IUser objects
        
        const nicknames = [] //holds only the nicknames of those IUser Objects
        const frontendSocketIDs = []
        const userMap = new Map();
        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          if (users[i].userrole === "spectator"){
            nicknames.push(users[i].nickname + " (Spectator)")
          }else{
            nicknames.push(users[i].nickname)
          }

          frontendSocketIDs.push(users[i].frontendsocketid)
        }


        users.forEach(user => {
          userMap.set(user.nickname, user.frontendsocketid);
        });

        console.log("Rendering", userMap)
        setTheUserMap(userMap);
        setCurrentUsers(users);
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
  
  const handleBackButton = () => {
    navigateTo('/host/select-lab')
  }
  
  const handleSubmit =() => {
    console.log('Attempting to start experiment...');
    //const allEmotiBitsConnected = emotiBits.every((user) => user.nickname && user.isConnected);
    if(!allDevicesConnected){
      toast.error("Cannot start experiment. Not all EmotiBits are connected!");
      return;
    }
    console.log("Starting experiment...")
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
            {Array.isArray(currentDevices) && currentDevices.length > 0 ? (
              currentDevices.map((device) => {
                // if (device.nickname !== null && device.associatedDevice.isConnected === true){
                  return(
                    <EmotiBitList key={device.userId} user={device} onAction={() => handleOpenModalSettings(user.userid)} />
                  );
                //}
              })
          ) : ( 
          <p> No EmotiBits connected yet.</p> 
        )}
          </div>
          <button
            onClick={handleOpenModalEmoti}
            className="mt-4 bg-[#7F56D9] hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out md:w-auto cursor-pointer"
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
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-gray-500 hover:bg-gray-400 text-white cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleOpenModal}
          className="mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white cursor-pointer"
        >
          Begin
        </button>
        {/*This will redirect to Media Page */}
      </div>
      <ModalComponent
        onAction={handleConnectEmotibit}
        onAction2={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="Connect Emotibits"
        button="Connect Emotibits"
        button2="Begin"
        isButtonDisabled={isBeginDisabled}
        isButton1Disabled={isConnectEmotibitDisabled}
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Before beginning the experiment, please connect Emotibits first.
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
