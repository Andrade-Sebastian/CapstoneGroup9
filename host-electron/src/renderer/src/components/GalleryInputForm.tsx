import React, { useRef, useState, useEffect, ReactElement } from 'react'
import { PiRocketLaunchThin } from 'react-icons/pi'
import { IoIosArrowUp } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { IoCloseCircle } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import SideComponent from './SideComponent.tsx'
import axios from 'axios'
import socket from '../Views/socket'

interface IGalleryInput {
  onFileSelected: (isFileSelected: boolean) => void
  onSourceChange: (source: string | null) => void
  imageSource: string | null
  onOpenModalPhoto: () => void
  onCaptionChange: (caption: string | null) => void
}

export default function GalleryInputForm(props: IGalleryInput) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    experimentTitle,
    experimentDesc,
    setExperimentTitle,
    setExperimentDesc,
    experimentId,
    roomCode,
    addPhoto,
    addPhotos,
    removePhoto,
    clearPhotos,
    setCurrentGalleryIndex,
    galleryPhotos,
    currentGalleryIndex,
    reorderPhoto
  } = useSessionStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caption, setCaption] = useState('')
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [image_filename, set_image_filename] = useState<string | null>(null)
  const [isModalOpenPhoto, setIsModalOpenPhoto] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [tempFile, setTempFile] = useState<File | null>(null)
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [imageID, setImageID] = useState(0)

  const navigateTo = useNavigate()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleOpenModalPhoto = () => setIsModalOpenPhoto(true)
  const handleCloseModalPhoto = () => setIsModalOpenPhoto(false)
  const handleConfirmImage = () => {
    if (tempImage && tempFile && caption) {
      const photo = {
        id: imageID + 1,
        src: tempImage,
        file: tempFile,
        caption: caption,
        uploadedAt: new Date()
      }
      addPhoto(photo)
      setImageID((prev) => prev + 1)
      setTempImage(null)
      setTempFile(null)
      setCaption('')
      handleCloseModalPhoto()
    } else {
      toast.error('Missing image or caption')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setError('No file selected.')
      props.onFileSelected(false)
      props.onSourceChange(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      props.onFileSelected(false)
      props.onSourceChange(null)
      return
    }

    setError(null)
    setFile(file)

    const url = URL.createObjectURL(file)
    setSource(url)
    props.onSourceChange(url)
    props.onFileSelected(true)

    const newPhoto = {
      id: imageID + 1,
      src: url,
      caption: caption,
      uploadedAt: new Date()
    }

    addPhoto(newPhoto)
    setImageID((prev) => prev + 1)
  }

  const handleRemoveImage = () => {
    setSource(null)
    props.onFileSelected(false)
    props.onSourceChange(null)
    props.onCaptionChange(null)
  }

  const handleAction = (e) => {
    console.log('Creating lobby...')
    handleSubmit(e)
    handleCloseModal()
  }

  useEffect(() => {
    if (galleryPhotos) {
      setIsFileSelected(true)
    }
  }, [galleryPhotos])

  //prevent memory leaks
  useEffect(() => {
    return () => {
      galleryPhotos.forEach((photo) => {
        if (photo.src.startsWith('blob:')) {
          URL.revokeObjectURL(photo.src)
        }
      })
    }
  }, [])

  async function handleSubmit(e) {
    const data = new FormData()
    console.log('Appending data in handle submit')
    data.append('labType', 'gallery-lab')
    data.append('experimentTitle', experimentTitle)
    data.append('experimentDescription', experimentDesc)
    data.append('experimentCaptions', caption)
    galleryPhotos.forEach((photo) => {
      data.append('images', photo.file)
      data.append('captions', photo.caption)
    })
    data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))
    console.log('Done appending data.')
    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //create a gallery lab
      console.log('Sending data', JSON.stringify(data))

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PATH}/database/gallery-lab`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      console.log('After /gallery-lab, ', JSON.stringify(response.data))

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const expId = response.data.experimentID
        const images = response.data.images
        setExperimentTitle(experimentTitle)
        setExperimentDesc(experimentDesc)
        console.log('Images from gallery', images)
        console.log('sending out some experiment data')
        socket.emit('experiment-data', { experimentTitle, experimentDesc, expId, images })
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
    console.log('gallery array: ', galleryPhotos)
    console.log('caption: ', caption)
    console.log('experimentTitle: ', experimentTitle)
    console.log('experimentDesc: ', experimentDesc)
    console.log('isFileSelected: ' + JSON.stringify(isFileSelected))
  }, [[galleryPhotos, caption, experimentDesc, experimentTitle]])

  return (
    <div className="flex flex-row w-full h-screen gap-30">
      {/* Middle */}
      <div className="flex flex-col items-center justify-center w-full md:w-2/5 space-y-6">
        <form
          onSubmit={handleSubmit}
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

          <div className="mb-6">
            <label
              htmlFor="experimentDesc"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Description for Experiment <span className="text-purple-500">*</span>
            </label>
            <textarea
              id="experimentDesc"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentDesc(e.target.value)}
              value={experimentDesc}
              placeholder="Provide a description for your experiment"
            />
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!experimentTitle.trim() || galleryPhotos.length < 2}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out  ${
                experimentTitle.trim() && galleryPhotos.length >= 2
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>

      {/* right side: adding picture.. */}
      <div className="w-full md:w-2/5 flex justify-center items-center mt-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-[350px]">
          <label className="block text-md font-medium text-gray-700 mb-2">
            Add a Picture
            <span className="text-purple-500"> *</span>
          </label>

          <div className="overflow-y-auto max-h-[300px] mb-4">
            {galleryPhotos.map((image, index) => (
              <div key={index} className="relative mb-4 bg-white p-2 rounded-md shadow-md">
                <div className="relative">
                  <img
                    src={image.src}
                    alt="Uploaded"
                    className="w-full h-[150px] object-cover rounded-md"
                  />
                  <div className="absolute bottom-1 left-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-md">
                    {index + 1}
                  </div>
                </div>

                <input
                  type="text"
                  value={image.caption}
                  className="w-5/6 ml-8 mt-2 p-2 border border-gray-300 rounded-lg text-sm"
                  disabled
                ></input>
                <button
                  className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() => removePhoto(image.id)}
                >
                  <IoCloseCircle size={20} />
                </button>
                <button
                  disabled={index === 0} //cant move up if at the top
                  className="absolute top-2 left-2 bg-gray-100 rounded-full p-1 text-black hover:bg-gray-200 cursor-pointer"
                  onClick={() => reorderPhoto(index, index - 1)}
                >
                  <IoIosArrowUp size={20} />
                </button>
                <button
                  disabled={index === galleryPhotos.length - 1} //cant move down if at the bottom
                  className="absolute bottom-2 left-2 bg-gray-100 rounded-full p-1 text-black hover:bg-gray-200 cursor-pointer"
                  onClick={() => reorderPhoto(index, index + 1)}
                >
                  <IoIosArrowDown size={20} />
                </button>
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />
          {/* <div className="mb-6">
            <label htmlFor="caption" className="block text-md font-medium text-gray-700 mb-2">
              Caption
            </label>
            <input
              type="text"
              id="caption"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={caption || ''}
            />
          </div> */}
          <button
            type="button"
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full cursor-pointer"
            onClick={handleOpenModalPhoto}
          >
            Add Photo
          </button>
        </div>
      </div>

      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="LAB CONFIRMATION"
        button="Create Lobby"
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
            Description of Experiment
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
            Uploaded Files
          </label>
          <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
            {galleryPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo.src}
                alt={`Image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
      </ModalComponent>
      <ModalComponent
        onAction={handleConfirmImage}
        isOpen={isModalOpenPhoto}
        onCancel={handleCloseModalPhoto}
        modalTitle="Add an Image"
        button="Confirm"
      >
        <div className="mb-6">
          <label htmlFor="experimentImage" className="block text-md font-medium text-gray-700 mb-2">
            File Upload <span className="text-purple-500"> *</span>
          </label>
          <input
            type="file"
            id="uploadImage"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const url = URL.createObjectURL(file)
                setTempImage(url)
                setTempFile(file)
              }
            }}
          />
        </div>
        {tempImage && (
          <div className="mb-6 flex justify-center">
            <img src={tempImage} alt="Preview" className="max-w-xs rounded-md shadow-md" />
          </div>
        )}
        <div className="mb-6">
          <label htmlFor="caption" className="block text-md font-medium text-gray-700 mb-2">
            Caption <span className="text-purple-500"> *</span>
          </label>
          <input
            type="text"
            id="caption"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      </ModalComponent>
    </div>
  )
}
