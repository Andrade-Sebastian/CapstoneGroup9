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
import toast, { Toaster } from 'react-hot-toast'
import ReactPlayer from 'react-player'
import GalleryComponent from '../components/GalleryComponent.tsx'
import GalleryViewer from '../components/GalleryViewer.tsx'

export default function ActivityStudentView(): ReactElement {
  const echoProcessAPI = window.api
  const [selectedButton, setSelectedButton] = useState('heartRate')
  const [activeTab, setActiveTab] = useState('images')
  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [recievedData, setRecievedData] = useState<number[]>([])
  const [currentUser, setCurrentUser] = useState('')
  const [currentUserId, setCurrentUserId] = useState(0)
  const [currentPath, setCurrentPath] = useState('')
  const [photoPath, setPhotoPath] = useState('')
  const [videoPath, setVideoPath] = useState('')
  const [galleryPath, setGalleryPath] = useState('')
  const [selectedCaption, setSelectedCaption] = useState('')
  const [articlePath, setArticlePath] = useState('')
  const [bpmAvg, setBpmAvg] = useState(0)
  const playerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempAvg, setTempAvg] = useState(0)
  const [gsrAvg, setGsrAvg] = useState(0)
  const [fileName, setFileName] = useState('')
  const [isMasked, setIsMasked] = useState(false)
  const [experimentID, setExperimentID] = useState(0)
  const [isMediaAFile, setIsMediaAFile] = useState(false)
  const [latestSeekTime, setLatestSeekTime] = useState(0)
  const [experimentPath, setExperimentPath] = useState('')
  const [currentGalleryPhotoID, setCurrentGalleryPhotoID] = useState(0)
  const {
    hostName,
    users,
    roomCode,
    setRoomCode,
    experimentTypeString,
    setExperimentTypeString,
    setSessionId,
    addUser,
    devices,
    removeUser,
    addDevice,
    removeDevice,
    videoLabSource,
    setVideoLabSource,
    videoID,
    setVideoID,
    articleURL,
    setArticleURL,
    articleLabSource,
    setArticleLabSource,
    photoLabImageSource,
    setExperimentId,
    experimentId,
    setExperimentTitle,
    setExperimentDesc,
    experimentTitle,
    addPhoto,
    experimentDesc,
    galleryPhotos
  } = useSessionStore()
  useEffect(() => {
    const debug = () => {
      console.log(`Session Store: Hostname${hostName}, RoomCode${roomCode}, videoLabSource${videoLabSource}, videoID${videoID}, articleURL${articleURL}, articleLabSource${articleLabSource}
        , photolabImageSource${photoLabImageSource}, experimentId${experimentId}, experimentTitle${experimentTitle}, experimentDesc${experimentDesc}, galleryPhotos${galleryPhotos}, selectedCaption ${selectedCaption}, currentGalleryPhotoID ${currentGalleryPhotoID}
        `)
    }
    debug()
  }, [
    hostName,
    roomCode,
    videoLabSource,
    videoID,
    articleURL,
    articleLabSource,
    photoLabImageSource,
    experimentId,
    experimentTitle,
    experimentDesc,
    galleryPhotos,
    selectedCaption,
    currentGalleryPhotoID
  ])

  const { sessionId, userId, experimentType } = useParams()
  console.log('PARAMS RECIEVED: ', sessionId, userId, experimentType)
  const handleMask = (targetUserId) => {
    const newMaskState = !isMasked
    socket.emit('toggle-mask', { userId: targetUserId })
    setIsMasked(newMaskState)
  }

  const handleUserKick = () => {
    //insert socket logic to kick user here
    console.log('Kicking user...')
    socket.emit("kick-active-student", userId);
  }

  // useEffect(() => {
  //   function kickUser()
  //   {
  //     //Global store that keeps track of whether the user has been previously kicked or not
  //     setWasKicked(true);
  //     console.log("Kick function. Here is the socketID and sessionID", socketId, sessionId)
  //     //removes user from database

  //     //sessionid is empty when making this request. Thats causing the bug
  //     console.log("Kicking user from database in sessionID: ", sessionId);
  //     //is sessionID the global one? or a useState?

  //     axios.post('http://VITE_BACKEND_PATH/joiner/leave-room', {
  //       sessionID: sessionId,
  //       socketID: socketId
  //     })
  //     .then(() =>{
  //       console.log("Successfully removed from database");
  //       navigateTo("/");
  //     })
  //     .catch(error =>{
  //       console.log("Error removing user from database", error)
  //     })
  //   }
  //   socket.on("kick", kickUser);
  //   console.log("Listening for 'kick event");
  //   return () => {
  //     socket.off("kick", kickUser);
  // }}, []);

  // useEffect(() => {
  //   const ipc = window.api;

  //   ipc.send('session:request-data');

  //   ipc.receive('session:sync', (sessionData) => {
  //     console.log("Populating store", sessionData);
  //     useSessionStore.setState(sessionData);

  //   });
  //   return () => {
  //     ipc.removeAllListeners?.('session:sync');
  //   };
  // },[])

  useEffect(() => {
    const checkVideoMediaType = () => {
      console.log('Detecting type of media based on path...   ExperimentPath: ', experimentPath)
      if (experimentPath) {
        if (experimentPath.length === 11) {
          //very flimsy way of detecting if the video is a youtube video. All youtube videoIDs have a length of 11 which is why this is done. There must be a better way.....
          console.log('Detected video as a YouTube link. Path length:', experimentPath.length)
          setIsMediaAFile(false)
          return
        } else {
          console.log('Detected video as a file. Path length:', experimentPath.length)
          setIsMediaAFile(true)
          return
        }
      }
    }
    const checkArticleMediaType = () => {
      console.log('Detecting type of media based on path...   ExperimentPath: ', experimentPath)
      if (experimentPath) {
        if (experimentPath.startsWith('https://') || experimentPath.startsWith('http://')) {
          console.log('Detected a link', experimentPath)
          setArticleURL(experimentPath)
          setIsMediaAFile(false)
          return
        } else {
          console.log('Detected article as a file.', experimentPath)
          setIsMediaAFile(true)
          return
        }
      } else {
        console.log('Experiment path is empty', experimentPath)
        return
      }
    }
    if (experimentType === 'video-lab') {
      console.log('ExperimentType is:', experimentType)
      checkVideoMediaType()
    } else if (experimentType === 'article-lab') {
      console.log('ExperimentType is:', experimentType)
      checkArticleMediaType()
    } else {
      console.log('Invalid experiment ID')
    }
  }, [experimentPath, experimentType, videoPath])

  //Gathering data such as RoomCode, user's nickname, filename, and userID
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/host/get-user-experiment/${sessionId}/${userId}/${experimentType}`
        )
        console.log('RESPONSE RECIEVED IN ACTIVITYSTUDENTVIEW', response.data)
        if (response.status === 200) {
          setCurrentUser(response.data.nickname)
          setFileName(response.data.path)
          setCurrentUserId(response.data.userid)
          setRoomCode(response.data.roomcode)
        }
      } catch (error) {
        console.error('Error retrieving user data', error)
      }
    }
    getUserData()
  }, [sessionId, experimentType, userId])

  //Using roomcode gathered earlier to fetch experimentID
  useEffect(() => {
    const fetchExperimentID = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/session/getInfo/${roomCode}`
        )
        if (response.status === 200) {
          console.log('EXPERIMENT ID RETURNED: ', response.data.experimentid)
          setExperimentID(response.data.experimentid)
        }
      } catch (error) {
        // toast.error("Failed to get experiment id")
        console.log('Error retrieving experiment id in joiner fe', error)
      }
    }
    fetchExperimentID()
  }, [roomCode])

  //using fetched experimentId to get relevant data
  useEffect(() => {
    const getVideoFileData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/getVideoFile/${experimentID}`
        )
        if (response.status === 200) {
          toast.success('Successfully received video lab data.')
          console.log('Returned get video data:', response.data)
          const experimentTitle = response.data.name
          const experimentDesc = response.data.description
          const path = response.data.path
          console.log('RESPONSE DATA VARIABLES:', experimentTitle, experimentDesc, path)
          setExperimentId(experimentID)
          setExperimentTitle(experimentTitle)
          setExperimentDesc(experimentDesc)
          setExperimentPath(path)
          if (path.length === 11) {
            setVideoID(path)
          }
        }
      } catch (error) {
        toast.error('Failed to receive video data')
        console.log('Error receiving video data in joiner FE:', error)
      }
    }
    //if(!experimentID) return;
    const getPhotoData = async () => {
      try {
        console.log('SENDING TO THE ROUTE EXPERIMENT ID: ', experimentID)
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/getPhoto/${experimentID}`
        )
        if (response.status === 200) {
          toast.success('Successfully received photo lab data.')
          console.log('RETURNED GET PHOTO DATA: ', response.data)
          const experimentTitle = response.data.name
          const captions = response.data.captions
          const experimentDesc = response.data.description
          const path = response.data.path
          //NEED THE EXPERIMENT TYPE
          console.log('RESPONSE DATA VARIABLES: ', captions, experimentDesc, experimentTitle, path)
          setExperimentId(experimentID)
          setExperimentTitle(experimentTitle)
          setExperimentDesc(experimentDesc)
          setExperimentPath(path)
        }
      } catch (error) {
        toast.error('Failed to receive photo data')
        console.log('Error receiving photolab data in joiner fe: ', error)
      }
    }
    const getGalleryData = async () => {
      try {
        console.log('SENDING TO THE ROUTE EXPERIMENT ID: ', experimentID)
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/getGallery/${experimentID}`
        )
        if (response.status === 200) {
          toast.success('Successfully received gallery lab data.')
          console.log('RETURNED GET GALLERY DATA: ', response.data)
          const experimentTitle = response.data.name
          const experimentDesc = response.data.description
          response.data.images.forEach((img, index) => {
            addPhoto({
              id: index,
              src: img.path,
              file: null,
              caption: img.caption
            })
          })

          //const images = response.data.images;
          // const captions = response.data.captions;
          // const path = response.data.path;
          //NEED THE EXPERIMENT TYPE
          console.log('RETURNED GET GALLERY DATA: ', response.data)
          console.log('GalleryPhoto data from getGallery', galleryPhotos)
          setExperimentId(experimentID)
          setExperimentTitle(experimentTitle)
          setExperimentDesc(experimentDesc)
          // images.forEach((image, index) => {
          //   addPhoto({
          //     id: index,
          //     src: image.path,
          //     file:null,
          //     caption: image.caption
          //   })
          // })
        }
      } catch (error) {
        toast.error('Failed to receive gallery data')
        console.log('Error receiving photolab data in joiner fe: ', error)
      }
    }
    const getArticleData = async () => {
      try {
        console.log('SENDING TO THE ROUTE EXPERIMENT ID: ', experimentID)
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/getArticleFile/${experimentID}`
        )
        if (response.status === 200) {
          toast.success('Successfully received article lab data.')
          console.log('RETURNED GET Article DATA: ', response.data)
          const experimentTitle = response.data.name
          const experimentDesc = response.data.description
          const path = response.data.path
          //NEED THE EXPERIMENT TYPE
          console.log('RESPONSE DATA VARIABLES: ', experimentDesc, experimentTitle, path)
          setExperimentId(experimentID)
          setExperimentTitle(experimentTitle)
          setExperimentDesc(experimentDesc)
          setExperimentPath(path)
        }
      } catch (error) {
        toast.error('Failed to receive Article data')
        console.log('Error receiving article lab data in joiner fe: ', error)
      }
    }
    if (experimentType === 'video-lab') {
      getVideoFileData()
    }
    if (experimentType === 'photo-lab') {
      getPhotoData()
    }
    if (experimentType === 'gallery-lab') {
      getGalleryData()
    }
    if (experimentType === 'article-lab') {
      getArticleData()
    }
  }, [
    experimentID,
    setExperimentDesc,
    setExperimentId,
    setExperimentTitle,
    setExperimentPath,
    experimentType
  ])

  // useEffect(() => {
  //   console.log("Running active experiment");
  //   console.log(
  //     "Experiment ID: ",
  //     experimentID
  //   );
  //   if(!experimentID){
  //     console.log("Experiment ID is null, aborting the fetch...");
  //     return;
  //   }
  //     const getPhotoInfo = async () => {
  //       const response = await axios
  //         .get(`http://VITE_BACKEND_PATH/joiner/getPhoto/${experimentID}`)
  //         .then((response) => {//THERE IS NOTHING BEING SET HERE
  //           console.log("Photo lab path in activity page:", response.data.path);
  //         });
  //     };

  //     const getVideoInfo = async () => {
  //       const response = await axios
  //         .get(`http://VITE_BACKEND_PATH/joiner/getVideoFile/${experimentID}`)
  //         .then((response) => {//THERE IS NOTHING BEING SET HERE
  //           console.log("Video lab path in activity page:", response.data.path);
  //           setVideoID(response.data.path);
  //           console.log("VideoID set to ", videoID)
  //         });
  //     };
  //     const getGalleryInfo = async () => {
  //       const response = await axios
  //         .get(`http://VITE_BACKEND_PATH/joiner/getGallery/${experimentID}`)
  //         .then((response) => {//THERE IS NOTHING BEING SET HERE
  //           console.log("Gallery lab path in activity page:", response.data.path);
  //         });
  //     };

  //     const getArticleInfo = async () => {
  //       const response = await axios
  //         .get(`http://VITE_BACKEND_PATH/joiner/getArticleFile/${experimentID}`)
  //         .then((response) => {//THERE IS NOTHING BEING SET HERE
  //           console.log("Article lab path in activity page:", response.data.path);
  //           setArticleURL(response.data.path);
  //           console.log("ArticleURL set to ", articleURL)
  //         });
  //     };

  //   socket.on("end-experiment", () => {
  //     // navigateTo("/");
  //     console.log("End experiment receieved, now need to close the window...")
  //   });

  //   if(experimentType === "video-lab"){
  //     setVideoPath(experimentPath)
  //     getVideoInfo();
  //   }
  //   if(experimentType === "photo-lab"){
  //     setPhotoPath(experimentPath)
  //     getPhotoInfo();
  //   }
  //   if(experimentType === "gallery-lab"){
  //     setGalleryPath(experimentPath)
  //     getGalleryInfo();
  //   }
  //   if(experimentType === "article-lab"){
  //     setArticlePath(experimentPath)
  //     getArticleInfo();
  //   }

  //   // socket.on("update", (data) => {
  //   //   if (Array.isArray(data)) {
  //   //     console.log("Data received:", data);
  //   //     setRecievedData(data);
  //   //   } else {
  //   //     console.error("Did not receive an array of data, received:", data);
  //   //   }
  //   // });
  //   return () => {
  //     socket.off("end-experiment");
  //     //socket.off("update");
  //   };
  // }, []);

  useEffect(() => {
    const fetchExperimentData = async () => {
      if (!experimentID) {
        console.log('There is no experimentID!!! Cannot fetch data...')
        return
      }
      try {
        let response

        switch (experimentType) {
          case 'photo-lab':
            response = await axios.get(
              `${import.meta.env.VITE_BACKEND_PATH}/joiner/getPhoto/${experimentID}`
            )
            if (response.status === 200) {
              setExperimentTitle(response.data.name)
              setExperimentDesc(response.data.description)
              setPhotoPath(response.data.path)
            }
            break
          case 'video-lab':
            response = await axios.get(
              `${import.meta.env.VITE_BACKEND_PATH}/joiner/getVideoFile/${experimentID}`
            )
            if (response.status === 200) {
              setExperimentTitle(response.data.name)
              setExperimentDesc(response.data.description)
              setVideoPath(response.data.path)
            }
            break

          case 'gallery-lab':
            response = await axios.get(
              `${import.meta.env.VITE_BACKEND_PATH}/joiner/getGallery/${experimentID}`
            )
            if (response.status === 200) {
              setExperimentTitle(response.data.name)
              setExperimentDesc(response.data.description)
              const images = response.data.images || []
              images.forEach((image, index) => {
                addPhoto({
                  id: index,
                  src: image.path,
                  caption: image.caption,
                  file: null
                })
              })
            }
            break

          case 'article-lab':
            response = await axios.get(
              `${import.meta.env.VITE_BACKEND_PATH}/joiner/getArticleFile/${experimentID}`
            )
            if (response.status === 200) {
              setExperimentTitle(response.data.name)
              setExperimentDesc(response.data.description)
              setArticlePath(response.data.path)
            }
            break
          default:
            console.log('Invalid experiment type:', experimentType)
        }
      } catch (error) {
        console.log('Error fetching experiment data', error)
      }
    }
    fetchExperimentData()
  }, [experimentID, experimentType])

  useEffect(() => {
    const fetchStoredPhoto = async () => {
      const filename = experimentPath.split('/').pop()
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/get-photo/${filename}`
        )
        if (response.status === 200) {
          console.log('Fetched image path:', response.config.url)
          setPhotoPath(response.config.url)
          toast.success('Successfully retreived photo!')
        }
      } catch (error) {
        console.log('Error retrieving image:', error)
      }
    }

    const fetchStoredVideo = async () => {
      const filename = experimentPath.split('/').pop()
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/get-videoFile/${filename}`
        )
        if (response.status === 200) {
          console.log('Fetched video path:', response.config.url)
          setVideoPath(response.config.url)
          setVideoLabSource(videoPath)
          console.log('In FetchStoredVideo', videoPath, videoLabSource)
          toast.success('Successfully retreived video!')
        }
      } catch (error) {
        console.log('Error retrieving video:', error)
      }
    }
    const fetchStoredGallery = async (filename: string) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/get-gallery/${filename}`
        )
        if (response.status === 200) {
          console.log('Fetched photo path:', response.config.url)
          setGalleryPath(response.config.url)
          toast.success('Successfully retreived image!')
        }
      } catch (error) {
        console.log('Error retrieving image from gallery:', error)
      }
    }
    const fetchStoredArticle = async () => {
      const filename = experimentPath.split('/').pop()
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/get-articleFile/${filename}`
        )
        if (response.status === 200) {
          console.log('Fetched article path:', response.config.url)
          setArticlePath(response.config.url)
          toast.success('Successfully retreived article!')
        }
      } catch (error) {
        console.log('Error retrieving article:', error)
      }
    }
    if (experimentType === 'video-lab') {
      console.log('Fetching video...')
      fetchStoredVideo()
    }
    if (experimentType === 'photo-lab') {
      console.log('Fetching photo...')
      fetchStoredPhoto()
    }
    if (experimentType === 'gallery-lab' && galleryPhotos.length > 0) {
      console.log('Fetching gallery...')
      socket.on('image-selected', (imageData) => {
        console.log(
          'Gallery image-selected event recieved. Host changed the image, fetching stored gallery...',
          imageData
        )
        setSelectedCaption(imageData.caption)
        const matchedPhoto = galleryPhotos.find((photo) => photo.id === imageData.id)
        if (matchedPhoto) {
          setCurrentGalleryPhotoID(matchedPhoto.id)
          const filename = matchedPhoto.src.split('/').pop()
          console.log('Here is the matchedPhoto correct filename', filename)
          fetchStoredGallery(filename)
        } else {
          console.log('No matching photo found for caption:', imageData.src)
        }
      })
      return () => {
        socket.off('image-selected')
      }
    }
    if (experimentType === 'article-lab') {
      console.log('Fetching article...')
      fetchStoredArticle()
    }
  }, [
    experimentPath,
    experimentType,
    setPhotoPath,
    setVideoPath,
    setArticlePath,
    articlePath,
    galleryPhotos
  ])

  useEffect(() => {
    socket.on('play-video', (data) => {
      console.log('Recieved event play-video.', data)
      setIsPlaying(data)
      console.log('The variable isPlaying is set to', isPlaying)
    })

    socket.on('seek-video', (seconds) => {
      console.log('Recieved event seek-video', seconds)
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, 'seconds')
      }
    })
    return () => {
      socket.off('play-video')
      socket.off('seek-video')
    }
  }, [])

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

  const toggleChart = (chartType: string) => {
    setActiveCharts((prev) =>
      prev.includes(chartType) ? prev.filter((chart) => chart !== chartType) : [...prev, chartType]
    )
  }

  // useEffect(()=>{
  //   //debug
  //   console.log("Experiment Type", experimentType, "Photolab:",photoLabImageSource)
  //   console.log("Experiment Type", experimentType, "Videolab:",videoID)
  //   console.log("Experiment Type", experimentType, "Videolab:",videoLabSource)
  //   console.log("Experiment Type", experimentType, "Articlelab:",articleLabSource)
  //   console.log("Experiment Type", experimentType, "Articlelab:",articleURL)
  //   console.log("Experiment Type", experimentType, "Gallery:", galleryPhotos)
  // },[photoLabImageSource, videoID, videoLabSource, articleURL, articleLabSource, galleryPhotos])

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white p-6 gap-6">
      {/* picture  */}
      <div className="flex flex-col w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4 ">
        <div className="relative flex justify-center items-center sm:mt-35 rounded-xl">
          {experimentType == 'video-lab' && isMediaAFile ? (
            <div>
              <ReactPlayer
                ref={playerRef}
                url={videoPath}
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
              src={photoPath}
              className="rounded-lg shadow-lg max-w-2xl w-[60%] md:w-[70%] lg:w-50%"
              alt="Experiment Image"
            ></img>
          ) : experimentType == 'gallery-lab' ? (
            <div>
              {galleryPath ? (
                <GalleryViewer
                  imageSrc={galleryPath}
                  caption={selectedCaption}
                  index={currentGalleryPhotoID}
                />
              ) : (
                <p className="text-xl text-gray-500 font-medium mt-10">
                  {' '}
                  Waiting for host to select a photo...
                </p>
              )}
            </div>
          ) : experimentType == 'article-lab' && isMediaAFile ? (
            // Not a huge bug but the source should be the article lab source, it's flip flopped, don't know why
            <div>
              <iframe src={articlePath} width="800px" height="500px"></iframe>
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
              className={`mt-6 font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out text-white text-3xl cursor-pointer ${
                isMasked ? 'bg-green-500 hover:bg-green-600' : 'bg-[#7F56D9] hover:bg-violet-500'
              }`}
              // onClick={() => {setSelectedButton("heartRate"); setActiveChart("heartRateChart");}}
              onClick={() => {
                handleMask(currentUserId)
              }}

              //className="bg-[#7F56D9] hover:bg-violet text-3xl p-4 rounded-lg text-white cursor-pointer"
              //onClick={() => {
              //setSelectedButton('heartRate')
              //setActiveChart('heartRateChart')
              //}}
            >
              {isMasked ? 'Unmask' : 'Mask'}
            </button>
            <button className="mt-6 font-semibold py-3 px-6 bg-[#F54884] shadow-md transition duration-300 ease-in-out hover:bg-[#F02B70] text-3xl p-4 rounded-xl text-white cursor-pointer" onClick={handleUserKick}>
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
                checked={activeCharts.includes('heartRate')}
                onChange={() => toggleChart('heartRate')}
              />
              <span> Heart Rate</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeCharts.includes('temperatureChart')}
                onChange={() => toggleChart('temperatureChart')}
              />
              <span> Temperature </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeCharts.includes('gsrChart')}
                onChange={() => toggleChart('gsrChart')}
              />
              <span> Skin Response (GSR) </span>
            </label>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 flex-grow">
            <ChartComponent user_id={currentUserId} chart_types={activeCharts} />
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
