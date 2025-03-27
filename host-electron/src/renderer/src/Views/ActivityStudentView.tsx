import { React, ReactElement, useCallback, useEffect, useState, useRef } from 'react'
import { useSessionStore } from '../store/useSessionStore.tsx'
import { useParams } from 'react-router-dom'
import { TbHeartRateMonitor } from 'react-icons/tb'
import { FaThermometerEmpty } from 'react-icons/fa'
import { LuSquareStack } from 'react-icons/lu'
import { BsChatSquareText } from 'react-icons/bs'
import { TbHexagons } from 'react-icons/tb'
import socket from './socket.tsx'
import axios from 'axios'
import { Divider } from '@heroui/divider'
import ChartComponent from '../Components/ChartComponent.tsx'
import { useJoinerStore } from '../hooks/stores/useJoinerStore.ts'
import { stringify } from 'postcss'
import { useNavigate } from 'react-router-dom'
import { session } from 'electron'
import ReactPlayer from 'react-player'
import GalleryComponent from '../components/GalleryComponent.tsx'

export default function ActivityStudentView(): ReactElement {
  const echoProcessAPI = window.api
  const [selectedButton, setSelectedButton] = useState('heartRate')
  const [activeTab, setActiveTab] = useState('images')
  const [activeChart, setActiveChart] = useState('heartRateChart')
  const [recievedData, setRecievedData] = useState<number[]>([])
  const [currentUser, setCurrentUser] = useState('')
  const [currentUserId, setCurrentUserId] = useState(0)
  const [currentPath, setCurrentPath] = useState('')
  const [bpmAvg, setBpmAvg] = useState(0)
  const playerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempAvg, setTempAvg] = useState(0)
  const [gsrAvg, setGsrAvg] = useState(0)
  const [fileName, setFileName] = useState('')
  const [isMediaAFile, setIsMediaAFile] = useState(false)
  const [latestSeekTime, setLatestSeekTime] = useState(0)
  const {
    hostName,
    users,
    roomCode,
    experimentTypeString,
    setExperimentTypeString,
    setSessionId,
    addUser,
    devices,
    removeUser,
    addDevice,
    removeDevice,
    videoLabSource,
    videoID,
    articleURL,
    articleLabSource,
    photoLabImageSource,
    experimentTitle,
    experimentDesc,
    galleryPhotos
  } = useSessionStore()

  const { sessionId, userId, experimentType } = useParams()
  console.log('PARAMS RECIEVED: ', sessionId, userId, experimentType)

  const handleUserKick = () => {
    //insert socket logic to kick user here
    console.log('Kicking user...')
  }

  useEffect(() => {
    const ipc = window.api;

    ipc.send('session:request-data');

    ipc.receive('session:sync', (sessionData) => {
      console.log("Populating store", sessionData);
      useSessionStore.setState(sessionData);

    });
    return () => {
      ipc.removeAllListeners?.('session:sync');
    };
  },[])

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
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/host/get-user-experiment/${sessionId}/${userId}/${experimentType}`
        )
        console.log('RESPONSE RECIEVED IN ACTIVITYSTUDENTVIEW', response.data)
        if (response.status === 200) {
          setCurrentUser(response.data.nickname)
          setFileName(response.data.path)
          setCurrentUserId(response.data.userid)
        }
      } catch (error) {
        console.error('Error retrieving user data', error)
      }
    }

    getUserData()
  }, [sessionId, experimentType, userId])

  useEffect(() => {
    const fetchStoredPhoto = async () => {
      // const filename = experimentPath.split("/").pop();
      try {
        const response = await axios.get(`http://localhost:3000/get-photo/${fileName}`)
        if (response.status === 200) {
          console.log('Fetched image path:', response.config.url)
          setCurrentPath(response.config.url)
        }
      } catch (error) {
        console.log('Error retrieving image:', error)
      }
    }
    fetchStoredPhoto()
  }, [setCurrentPath])

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

  useEffect(()=>{
    //debug
    console.log("Experiment Type", experimentType, "Photolab:",photoLabImageSource)
    console.log("Experiment Type", experimentType, "Videolab:",videoID)
    console.log("Experiment Type", experimentType, "Videolab:",videoLabSource)
    console.log("Experiment Type", experimentType, "Articlelab:",articleLabSource)
    console.log("Experiment Type", experimentType, "Articlelab:",articleURL)
    console.log("Experiment Type", experimentType, "Gallery:", galleryPhotos)
  },[photoLabImageSource, videoID, videoLabSource, articleURL, articleLabSource, galleryPhotos])

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white p-6 gap-6">
      {/* picture  */}
      <div className="flex flex-col w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4">
        <div className="relative flex justify-center items-center rounded-xl">
          {experimentType == 'video-lab' && isMediaAFile ? (
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
          ) : experimentType == 'video-lab' && !isMediaAFile ? (
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
          ) : experimentType == 'photo-lab' ? (
            <img
              src={photoLabImageSource}
              className="rounded-lg shadow-lg max-w-2xl w-[60%] md:w-[70%] lg:w-50%"
              alt="Experiment Image"
            ></img>
          ) : experimentType == 'gallery-lab' ? (
            <div className="w-full mt-8">
              <h2 className="text-xl font-semibold mb-4 text-center"> Uploaded Gallery</h2>
              <GalleryComponent images={galleryPhotos} />
            </div>
          ) : experimentType == 'article-lab' && isMediaAFile ? (
            // Not a huge bug but the source should be the article lab source, it's flip flopped, don't know why
            <div>
              <iframe src={articleLabSource} width="800px" height="500px"></iframe>
            </div>
          ) : experimentType == 'article-lab' && !isMediaAFile ? (
            <div>
              <iframe src={articleURL} width="800px" height="500px"></iframe>
            </div>
          ) : (
            <div>
              <p className="text-red-500">Invalid experiment type... </p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto py-4">
          <p className="font-semibold">
            Viewing Joiner: <span className="font-light">{currentUser}</span>
          </p>
          <div className="flex space-x-4">
            <button
              className="bg-[#7F56D9] hover:bg-violet text-3xl p-4 rounded-lg text-white cursor-pointer"
              onClick={() => {
                setSelectedButton('heartRate')
                setActiveChart('heartRateChart')
              }}
            >
              Mask
            </button>
            <button className="bg-[#F54884] hover:bg-[#F02B70] text-3xl p-4 rounded-lg text-white cursor-pointer">
              Kick
            </button>
          </div>
        </div>
      </div>
      {/* Chart stuff*/}
      <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-semibold mb-2">Select a chart to display:</p>
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeChart === 'heartRateChart'}
                onChange={() => setActiveChart('heartRateChart')}
              />
              <span> Heart Rate</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeChart === 'temperatureChart'}
                onChange={() => setActiveChart('temperatureChart')}
              />
              <span> Temperature </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeChart === 'gsrChart'}
                onChange={() => setActiveChart('gsrChart')}
              />
              <span> Skin Response (GSR) </span>
            </label>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 flex-grow">
            {activeChart === 'heartRateChart' && (
              <div>
                <p className="text-lg font-semibold">ECG Chart - {bpmAvg || '33'} BPM Average</p>
                <ChartComponent
                  chart_type={1}
                  chart_name="BPM"
                  chart_color="rgb(255,0,0)"
                  user_id={currentUserId}
                />
              </div>
            )}
            {activeChart === 'temperatureChart' && (
              <div>
                <p className="text-lg font-semibold">Body Temp - {tempAvg ||'98'}°F Average</p>
                <ChartComponent
                  chart_type={1}
                  chart_name="°F"
                  chart_color="rgb(0,0,255)"
                  user_id={currentUserId}
                />
              </div>
            )}
            {activeChart === 'gsrChart' && (
              <div>
                <p className="text-lg font-semibold">Skin Response - {gsrAvg || '3.4'} μS Average</p>
                <ChartComponent
                  chart_type={1}
                  chart_name="EDA"
                  chart_color="rgb(75,0,130)"
                  user_id={currentUserId}
                />
              </div>
            )}
          </div>
        </div>
        {/* <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-semibold">Thermister (BodyTemperature) - 98°F Average</p>
            <ChartComponent chart_type={2} chart_name="°F" chart_color="rgb(0,0,255)" user_id={currentUserId}/>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-semibold">Galvanic Skin Response (GSR) - 3.4 μS Average</p>
            <ChartComponent chart_type={3} chart_name="EDA" chart_color="rgb(75,0,130)" user_id={currentUserId}/>
          </div> */}
      </div>
    </div>
  )
}
