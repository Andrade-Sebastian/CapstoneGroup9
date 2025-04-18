import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SideComponent from '../components/SideComponent.tsx'
import { IoEarthOutline } from 'react-icons/io5'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import { useSessionStore } from '../store/useSessionStore.tsx'
import toast, { Toaster } from 'react-hot-toast'
import React from 'react'

// This is where the host will create the room

export default function HostCreateRoom() {
  const [userName, setUserName] = useState('')
  const [allowSpectators, setAllowSpectators] = useState(false)
  const [password, setPassword] = useState('') //store this in backend!!
  const [type, setType] = useState('password')
  const [icon, setIcon] = useState(eyeOff)
  const navigateTo = useNavigate()
  const {
    setHostName,
    setSessionId,
    setRoomCode,
    setUsers,
    setSpectators,
    sessionId,
    roomCode,
    setExperimentId,
    setExperimentTitle,
    setExperimentType,
    setExperimentDesc,
    setExperimentTypeString,
    setVideoLabSource,
    setPhotoLabImageSource,
    setArticleLabSource,
    setArticleURL,
    setVideoID,
    setVideoURL
  } = useSessionStore()

  function clearZustandStates() {
    setHostName('')
    setSessionId('')
    setRoomCode('')
    setExperimentId(0)
    setExperimentTitle('')
    setExperimentType(0)
    setExperimentDesc('')
    setExperimentTypeString('')
    setVideoLabSource('')
    setVideoID('')
    setArticleLabSource('')
    setPhotoLabImageSource('')
    setArticleURL('')
    setVideoURL('')
  }

  useEffect(() => {
    console.log('Clearing zustand states...')
    clearZustandStates()
  }, [])

  useEffect(() => {
    console.log('Session ID: ' + sessionId)
    console.log('Room Code: ' + roomCode)
  }, [sessionId, roomCode])

  function handleToggle() {
    //have eye open if text is censored, if not then eye closed
    if (type === 'password') {
      setIcon(eye)
      setType('text')
    } else {
      setIcon(eyeOff)
      setType('password')
    }
  }

  //hardcoded to test host/session/create
  // const [sessionInfo, setSessionInfo] = useState({
  //   sessionName: '',
  //   selectedExperimentId: '17', //(ideally this would be undefined)
  //   password: password,
  //   allowSpectators: true
  // })

  // const testSessionInfo = {
  //   sessionName: 'Awesome',
  //   selectedExperimentId: '17',
  //   allowSpectators: true,
  //   password: ''
  // }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userName.trim()) {
      toast.error('Please enter a valid name.')
      return
    } else if (!password.trim() || password.length < 3) {
      toast.error('Please enter a password of at least more than three characters')
    }

    console.log('creating an experiment')

    setHostName(userName)

    setUsers([])

    axios
      .post(`http://${import.meta.env.VITE_BACKEND_PATH}/host/session/create`, {
        hostSocketID: sessionStorage.getItem('socketID'),
        isPasswordProtected: true,
        password: password,
        isSpectatorsAllowed: allowSpectators
      })
      .then((response) => {
        //
        if (response.status === 200) {
          setSessionId(response.data.sessionid)
          setRoomCode(response.data.roomcode)
          setSpectators(allowSpectators)
        }
        console.log(response.data)
        //navigate to idk
        navigateTo('/host/select-lab/')
      })

    console.log('Username: ' + userName)
    console.log('Continue Button clicked')
    console.log('Navigating to Media')
  }

  console.log('Allow Spectators? ' + allowSpectators)
  console.log('---------')
  // <div className="flex justify-center items-center min-h-screen h-auto p-4 place-content-center ">
  // <div className="bg-white rounded-xl p-8 shadow-lg w-4/5 min-h-[1000px] place-content-center">
  //   <form onSubmit={handleSubmit} className="flex flex-col gap-14">
  return (
    <div className="h-full flex place-content-center ">
      <div className="flex md:flex-row md:gap-4 lg:gap-[90px] mx-6 lg:max-w-[1024px]">
        <div className="flex flex-col md:flex-row max-sm:hidden items-center justify-center">
          <Toaster position="top-right" />
          <SideComponent
            icon={<IoEarthOutline style={{ fontSize: '200px' }} />}
            headingTitle="Start an Experiment"
            description="Provide your name and a password to begin. Check the box if you want to have spectators."
          />
        </div>
        <div className="flex flex-col items-center justify-center w-fit p-6 ">
          <form onSubmit={handleSubmit} className="max-w-md w-[400px]">
            <div className="mb-6">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name <span className="text-purple-500">*</span>
              </label>
              <input
                type="text"
                id="userName"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                //   focus:outline-none focus:ring-2 focus:ring-indigo-500
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
                placeholder="Name"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-2">
                Set a password <span className="text-purple-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  placeholder="Password"
                  id="Password"
                  type={type}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />

                <span
                  className="absolute inset-y-0 right-3 cursor-pointer flex justify-around items-center"
                  onClick={handleToggle}
                >
                  <Icon className="absolute mr-10" icon={icon} size={25} />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="allowSpectators"
                  className="h-4 w-4 accent-[#7F56D9] cursor-pointer"
                  checked={allowSpectators}
                  onChange={() => setAllowSpectators(!allowSpectators)}
                />
                <label htmlFor="allowSpectators" className="text-sm font-medium text-gray-700">
                  Allow Spectators
                </label>
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center">
              <button
                type="submit"
                disabled={!userName.trim() || !password.trim()}
                className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out cursor-pointer ${
                  userName.trim() && password.trim()
                    ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                Host Lobby
              </button>
              {/*This will redirect to Media Page */}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
