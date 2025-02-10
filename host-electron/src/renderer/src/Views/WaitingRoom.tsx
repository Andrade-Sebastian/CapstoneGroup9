import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CiPlay1 } from 'react-icons/ci'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam } from 'react-icons/io5'
import socket from './socket'
import axios from 'axios'
import { Divider } from '@heroui/divider'
import WaitingRoomCardComponent from '../components/Components/WaitingRoomCardComponent'
import { IUser } from '@renderer/hooks/useSessionState'
import EmotiBitList from '../components/Components/EmotiBitList'
import { CiCircleCheck } from 'react-icons/ci'
import { error } from 'console'
export default function WaitingRoom() {
  const location = useLocation()
  const { nickName, roomCode, labID, name, description, imageUrl } = location.state || {}
  const [nicknames, setNickNames] = useState<string[]>([])
  const [sessionID, setSessionID] = useState('')
  const [experimentTitle, setExperimentTitle] = useState(name || '')
  const [experimentDesc, setExperimentDesc] = useState(description || '')
  const [experimentType, setExperimentType] = useState<string>('')
  const [experimentIcon, setExperimentIcon] = useState<JSX.Element>(
    <CiPlay1 style={{ fontSize: '20px' }} />
  )
  const [emotiBits, setEmotiBits] = useState([
    {
      userId: 'user1',
      socketId: 'socket123',
      nickname: 'Alice',
      associatedDevice: {
        serialNumber: 'SN001',
        ipAddress: '192.168.1.10'
      }
    },
    {
      userId: 'user2',
      socketId: 'socket456',
      nickname: 'Bob',
      associatedDevice: {
        serialNumber: 'SN002',
        ipAddress: '192.168.1.11'
      }
    },
    {
      userId: 'user3',
      socketId: 'socket789',
      nickname: null,
      associatedDevice: null
    }
  ])

  // const userElements = emotiBits.map((user: IUser) => {<EmotiBitList user={user} key={Number(user.userId)} isConnected={false}/>})

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
    if (labID === '1') {
      setExperimentType('VideoLab')
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (labID === '2') {
      setExperimentType('PhotoLab')
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (labID === '3') {
      setExperimentType('GalleryLab')
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else {
      toast.error('Invalid labID received:', labID)
    }
  }, [labID])
  return (
    <div className="flex flex-col items-center justify-center h-1/2 mx-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-72">
        {/* left section */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl text-3xl font-semibold text-gray-800">Welcome to Session</h1>
          <p className="text-6xl font-bold text-[#894DD6]">{roomCode}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold"> NICKNAME:</span> {nickName}
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
        <div className="w-full flex flex-col ">
          <EmotiBitList
            icon={<CiCircleCheck style={{ fontSize: '20px' }} />}
            joiner="Joanna"
            serial="AS8FD90G9DD0GD9F"
            ip="123.456.78"
          ></EmotiBitList>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex justify-center space-x-8 text-lg font-medium text-gray-800">
        {nicknames.map((name, index) => (
          <p key={index}>{name}</p>
        ))}
      </div>
    </div>
  )
}
