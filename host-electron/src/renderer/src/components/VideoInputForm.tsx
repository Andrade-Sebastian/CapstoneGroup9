import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import axios from 'axios'
import socket from '../Views/socket'
import React from 'react'
import ReactPlayer from 'react-player'
import { eventNames } from 'process'
import { clear } from 'console'

//youtube links to test
//https://www.youtube.com/embed/feZCSrOzhss?si=i9JF8UYCzJLNene5
//https://www.youtube.com/watch?v=feZCSrOzhss&ab_channel=CBSSportsGolazo

interface IVideoInputForm {
  width: number
  height: number
  onFileSelected: (isFileSelected: boolean) => void
  videoSource?: string
  imageUrl?: string
}

export default function VideoInputForm(props: IVideoInputForm) {
  const inputRef = React.useRef<HTMLInputElement>(null) //access to file input when the host clicks choose image button
  const [source, setSource] = React.useState<string | null>(null) //URL of the file that is selected is stored here.
  const [error, setError] = React.useState<string | null>(null) //need this just in case user doesn't select an image or another error comes up

  const {
    //Global state
    experimentId,
    experimentType,
    roomCode,
    experimentTitle,
    experimentDesc,
    videoLabSource,
    setExperimentTitle,
    setExperimentDesc,
    setVideoLabSource,
    setVideoURL,
    videoURL,
    setVideoID,
    videoID
  } = useSessionStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isValidURL, setIsValidURL] = useState(false)
  const [usingLink, setUsingLink] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // const [experiment_title, set_experiment_title] = useState("");
  // const [experiment_description, set_experiment_description] = useState("");
  const [video_filename, set_video_filename] = useState<string | null>(null)

  const navigateTo = useNavigate()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleAction = (e) => {
    console.log('Creating lobby...')
    handleSubmit(e)
    handleCloseModal()
  }

  const clearFileSelection = () => {
    setFile(null)
    set_video_filename(null)
    setVideoLabSource('')
    setIsFileSelected(false)
  }

  const clearVideoLinks = () => {
    setVideoURL('')
    setVideoID(null)
    setIsValidURL(false)
  }
  //YOUTUBE LINKS LOGIC
  //Constantly checking whether the host is using a link or not
  useEffect(() => {
    console.log('Checking whether host is typing a YouTube link')
    if (!videoURL) {
      console.log('Host is NOT typing a link...')
      setUsingLink(false)
    }
    console.log('Host is typing a link....')
    setUsingLink(true)
  }, [videoURL])

  useEffect(() => {
    if (!videoURL.trim()) {
      console.log('YouTube link was cleared, allowing for file upload.')
      setVideoID(null)
      setIsValidURL(false)
      setUsingLink(false)
    }
  }, [videoURL])

  useEffect(() => {
    if (videoID && videoLabSource) {
      toast.error('Detected both a video and file. Please choose one.')
      clearFileSelection()
    }
  }, [videoID, videoLabSource])

  function convertLinkToVideoID(url: string) {
    const VID_REGEX =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(VID_REGEX)
    if (match && match[1]) {
      console.log('HERE IS THE VIDEO ID HOPEFULLY', match[1])
      setIsValidURL(true)
      setUsingLink(true)
      console.log('IS the url valid rn?', isValidURL)
      return setVideoID(match[1])
    } else {
      toast.error('Invalid YouTube URL format.')
    }
  }

  const handleLinkSubmission = (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      const isTheURLValid = ReactPlayer.canPlay(videoURL)
      if (isTheURLValid) {
        toast.success('Your link is valid!')
        convertLinkToVideoID(videoURL)
        clearFileSelection()
      } else {
        setIsValidURL(false)
        toast.error('URL is not a YouTube link.')
      }
    }
  }

  useEffect(() => {
    if (video_filename) {
      setIsFileSelected(true)
    }
  }, [video_filename])

  async function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData()
    data.append('labType', 'video-lab')
    data.append('experimentTitle', experimentTitle)
    data.append('experimentDescription', experimentDesc)

    if (usingLink && isValidURL) {
      data.append('videoID', videoID)
      data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))
    } else if (file) {
      data.append('videoBlob', file)
      data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))
    } else {
      toast.error('Please provide a valid YouTube link or upload a video file.')
      return
    }

    // if (file) {
    //   console.log('File selected')
    // } else {
    //   console.log('No file selected. RETURNINGGGGGG')
    //   return
    // }

    //axios.post('http://httpbin.org/anything', data).then((res) => {console.log("Step 1 RES:", JSON.stringify(res.data));}).catch((err) => {console.log(err);});

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //create a photo lab
      console.log('Sending data', JSON.stringify(data))
      const response = await axios.post('http://localhost:3000/database/video-lab', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log('After /video-lab, ', JSON.stringify(response.data))

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const expId = response.data.experimentID
        console.log('sending out some experiment data')
        socket.emit('experiment-data', { experimentTitle, experimentDesc, expId })
        console.log('hopefully sent out some experiment data')

        setTimeout(() => {
          navigateTo('/waiting-room')
        }, 2000)
      } else {
        //Lab creation fails
        toast.error('Could not create lab, try again', { id: loadingToastId })
      }
    } catch (error) {
      console.error('Could not create lab, try again', error)
      toast.error('Could not create lab, try again', { id: loadingToastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  //debug
  useEffect(() => {
    console.log('image source: ', video_filename)
    console.log('experimentTitle: ', experimentTitle)
    console.log('experimentDesc: ', experimentDesc)
    console.log('isFileSelected: ' + JSON.stringify(isFileSelected))
  }, [[videoLabSource, experimentDesc, experimentTitle]])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] //retrieves the file by the host from the input's files array.
    console.log(file)
    console.log('File name: ' + file?.name)

    setFile(event.target.files?.[0] || null)

    if (!file) {
      setError('No file selected.')
      props.onFileSelected(false) //no file is selected. setting to false so that host cannot continue without selecting an image
      return
    }

    if (!file.type.startsWith('video/')) {
      //makes sure that the file is an image
      setError('Please upload a valid video file.')
      toast.error('Please upload a valid video file.')
      props.onFileSelected(false) //no file selected. set to false so host cannot continue without selecting an image
      return
    }
    clearVideoLinks()
    setFile(file)
    setError(null)
    const url = URL.createObjectURL(file) //a temp url is generated for the selected file which is stored in the source state for previewing the image
    set_video_filename(file.name)
    setVideoLabSource(url)
    props.onFileSelected(true) //file is selected, host can now continue
  }
  const handleChoose = () => {
    inputRef.current?.click()
  }

  async function sendData(e) {
    console.log('Sent')
  }
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-3/5 p-6 min-h-[600px] space-y-6 mt-50">
        {/* <p className="text-lg text-gray-600"> Experiment ID: {experimentType || "None"}</p>
            <p className="text-lg text-gray-600"> Room Code: {roomCode || "None"}</p> */}
        <form
          onSubmit={(e) => handleSubmit}
          className="w-full max-w-md space-y-6"
          encType="multipart/form-data"
        >
          <div className="w-full">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Title for Experiment <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              id="experimentTitle"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentTitle(e.target.value)}
              value={experimentTitle}
              placeholder="Provide a title for your experiment"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="experimentDesc"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Description for Experiment
            </label>
            <textarea
              id="experimentDesc"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentDesc(e.target.value)}
              value={experimentDesc}
              placeholder="Provide a description for your experiment"
            ></textarea>
          </div>

          <div className="w-full">
            <label htmlFor="addVideo" className="block text-lg font-semibold text-gray-700 mb-2">
              Add a Video<span className="text-purple-500"> *</span>
            </label>
            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter YouTube Link (Press Enter to Confirm)
            </label>
            <div className="flex flex-row">
              <input
                type="text"
                id="video-url"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setVideoURL(e.target.value)}
                onKeyDown={handleLinkSubmission}
                placeholder="Paste YouTube link here..."
              ></input>

              {/* <button className='ml-2 font-semibold py-1 px-3 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white' onClick={handleLinkSubmission}>Submit</button> */}
            </div>
            <div className="flex justify-center mt-4">
              {/* <iframe width="560" height="315" src={`https://www.youtube.com/embed/${videoURL}`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
              {isValidURL && usingLink ? (
                <div>
                  <ReactPlayer
                    url={`https://www.youtube.com/embed/${videoID}&origin=http://localhost:5173/`}
                    controls={true}
                    config={{
                      youtube: {
                        playerVars: {
                          modestbranding: 1, // Hides YouTube logo
                          rel: 0, // Prevents showing related videos
                          showinfo: 0, // Hides video info
                          playsinline: 1, // Forces inline play, reducing CORS issues
                          enablejsapi: 1, // Allows better control via API
                          origin: 'https://www.youtube.com'
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center border p-4 rounded-md shadow-md size-">
                  <input
                    ref={inputRef}
                    className="flex flex-col justify-center items-center border"
                    type="file"
                    onChange={(e) => {
                      handleFileChange(e)
                      setFile(e.target.files?.[0] || null)
                    }}
                    accept=".mov,.mp4" //restricts just these video files
                  />

                  {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
                  {/* image Preview */}
                  {videoLabSource && (
                    <div className="mt-4">
                      <video
                        width={props.width}
                        height={props.height}
                        controls
                        src={videoLabSource}
                        className="rounded-md shadow-md"
                      />
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-600">
                    {videoLabSource ? 'Video selected' : ' Please select a video'}
                    {/* show url or if there isn't anything, then just show nothing selected text */}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal} //create the object
              disabled={
                ((!experimentTitle.trim() || !isFileSelected) &&
                  (!experimentTitle.trim() || !isValidURL)) ||
                (isFileSelected && isValidURL)
              }
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out cursor-pointer ${
                (experimentTitle.trim() && isFileSelected) ||
                (experimentTitle.trim() && isValidURL && !(isFileSelected && isValidURL))
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </form>

        {/* Modal that appears after submitting */}
      </div>
      <ModalComponent
        onAction={handleAction} //put new stuff in handleAction
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        button="Create Lobby"
        modalTitle="LAB CONFIRMATION"
      >
        <div className="mb-6">
          <label htmlFor="experimentTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Title of Experiment
          </label>
          <input
            type="text"
            id="experimentTitle"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={experimentTitle}
            onChange={(e) => setExperimentTitle(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="experimentDesc" className="block text-sm font-medium text-gray-700 mb-2">
            Description of Experiment{' '}
          </label>
          <textarea
            id="experimentDesc"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            //   focus:outline-none focus:ring-2 focus:ring-indigo-500
            onChange={(e) => setExperimentDesc(e.target.value)}
            value={experimentDesc}
            disabled
          ></textarea>
        </div>
        <div className="mb-6">
          <label htmlFor="experimentVideo" className="block text-md font-medium text-gray-700 mb-2">
            File Upload
          </label>
          {isValidURL && usingLink ? (
            <input
              type="text"
              id="video-url"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={videoURL}
            />
          ) : (
            <input
              type="text"
              id="experimentImage"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={JSON.stringify(video_filename)}
              onChange={(e) => setVideoLabSource(e.target.value)}
            />
          )}
        </div>
      </ModalComponent>
    </>
  )
}
