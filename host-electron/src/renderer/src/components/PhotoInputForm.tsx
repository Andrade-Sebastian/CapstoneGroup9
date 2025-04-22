import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import axios from 'axios'
import socket from '../Views/socket'
import React from 'react'

interface IPhotoInputForm {
  width: number
  height: number
  onFileSelected: (isFileSelected: boolean) => void
  imageSource: string | undefined
}

export default function PhotoInputForm(props: IPhotoInputForm) {
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
    photoLabImageSource,
    setExperimentTitle,
    setExperimentDesc,
    setPhotoLabImageSource
  } = useSessionStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caption, setCaption] = useState('')
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [image_filename, set_image_filename] = useState<string | null>(null)

  const navigateTo = useNavigate()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleAction = (e) => {
    console.log('Creating lobby...')
    handleSubmit(e)
    handleCloseModal()
  }

  useEffect(() => {
    if (image_filename) {
      setIsFileSelected(true)
    }
  }, [image_filename])

  async function handleSubmit(e) {
    const data = new FormData()
    data.append('labType', 'photo-lab')
    data.append('experimentTitle', experimentTitle)
    data.append('experimentDescription', experimentDesc)
    data.append('experimentCaptions', caption)
    data.append('imageBlob', file)

    if (file) {
      console.log('File selected')
    } else {
      console.log('No file selected.')
      return
    }
    data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))

    //axios.post('http://httpbin.org/anything', data).then((res) => {console.log("Step 1 RES:", JSON.stringify(res.data));}).catch((err) => {console.log(err);});

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //create a photo lab
      console.log('Sending data', JSON.stringify(data))

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PATH}/database/photo-lab`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      console.log('After /photo-lab, ', JSON.stringify(response.data))

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const expId = response.data.experimentID
        setExperimentTitle(experimentTitle)
        setExperimentDesc(experimentDesc)
        set_image_filename(photoLabImageSource)
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
    console.log('image source: ', image_filename)
    console.log('caption: ', caption)
    console.log('experimentTitle: ', experimentTitle)
    console.log('experimentDesc: ', experimentDesc)
    console.log('isFileSelected: ' + JSON.stringify(isFileSelected))
  }, [[photoLabImageSource, caption, experimentDesc, experimentTitle]])

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

    if (!file.type.startsWith('image/')) {
      //makes sure that the file is an image
      setError('Please upload a valid image file.')
      props.onFileSelected(false) //no file selected. set to false so host cannot continue without selecting an image
      return
    }
    setError(null)
    const url = URL.createObjectURL(file) //a temp url is generated for the selected file which is stored in the source state for previewing the image
    set_image_filename(file.name)
    setPhotoLabImageSource(url)
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
              Enter Description for Experiment{' '}
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
            <label htmlFor="addImage" className="block text-sm font-medium text-gray-700 mb-2">
              {' '}
              Add Image <span className="text-purple-500"> *</span>
            </label>
            <div className="flex flex-col justify-center items-center border p-4 rounded-md shadow-md size-">
              <input
                ref={inputRef}
                className="flex flex-col justify-center items-center border"
                type="file"
                onChange={(e) => {
                  handleFileChange(e)
                  setFile(e.target.files?.[0] || null)
                }}
                accept="image/jpg, image/jpeg, image/png" //restricts just these image files
              />

              {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
              {/* image Preview */}
              {photoLabImageSource && (
                <div className="mt-4">
                  <img
                    width={props.width}
                    height={props.height}
                    src={photoLabImageSource}
                    alt="Selected Preview"
                    className="rounded-md shadow-md"
                  />
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600">
                {source ? 'Image selected' : ' Please select an image'}
                {/* show url or if there isn't anything, then just show nothing selected text */}
              </div>
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a Caption<span className="text-purple-500"> *</span>
            </label>
            <input
              type="text"
              id="caption"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setCaption(e.target.value)}
              value={caption}
            />
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal} //create the object
              disabled={!experimentTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentTitle.trim() && isFileSelected
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white cursor-pointer'
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
          <label htmlFor="experimentImage" className="block text-md font-medium text-gray-700 mb-2">
            File Upload
          </label>
          <input
            type="text"
            id="experimentImage"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={JSON.stringify(image_filename)}
            onChange={(e) => setPhotoLabImageSource(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="caption" className="block text-md font-medium text-gray-700 mb-2">
            Caption
          </label>
          <input
            type="text"
            id="caption"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      </ModalComponent>
    </>
  )
}
