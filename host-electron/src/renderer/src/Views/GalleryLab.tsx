import { PiRocketLaunchThin } from 'react-icons/pi'
import SideComponent from '../components/SideComponent.tsx'
import React, { useEffect, useState } from 'react'
import GalleryInput from '../components/GalleryInput'
import ModalComponent from '../components/ModalComponent.tsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useSessionStore } from '../store/useSessionStore.tsx'

export default function GalleryLab() {
  const { experimentId, roomCode } = useSessionStore();
  const [experimentTitle, setExperimentTitle] = useState('')
  const [experimentDesc, setExperimentDesc] = useState('')
  const [file, setFile] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caption, setCaption] = useState()
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenPhoto, setIsModalOpenPhoto] = useState(false)
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [imageList, setImageList] = useState<{url: string; caption: string} []>([])
  //
  const navigateTo = useNavigate()
  
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => {
    setTempImage(null)
    setIsModalOpen(false)}
  const handleAction = () => {
    console.log('Creating lobby...')
    handleSubmit()
    //navigateTo("/waiting-room", {state: {nickName, roomCode}});
    handleCloseModal()
  }
  const handleOpenModalPhoto = () => setIsModalOpenPhoto(true)
  const handleCloseModalPhoto = () => setIsModalOpenPhoto(false)
  const handleConfirmImage = () =>{
    setImageSource(tempImage)
    setIsFileSelected(!!tempImage)
    setIsModalOpenPhoto(false)
  }

  const handleAddImage =(image: {url: string; caption; string}) => {
    setImageList((prev) => [...prev, image])
  }

  const handleRemoveImage = (index: number) =>{
    setImageList((prev) => prev.filter((_, i) => i !== index))
  }



  // const handleActionPhoto = () => {
  //   console.log('Opening Modal for Gallery')
  //   handleCloseModalPhoto()
  // }
  
  async function handleSubmit() {
    //ADD TOASTS AND MODAL CONFIRMATION
    //add to database using /database/photo-lab
    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //logic for sending code to backend
      //Create the experiment before doing this
      const response = await axios.post('http://localhost:3000/database/gallery-lab', {
        experimentID: experimentId,
        path: imageSource, //null
        captions: caption
      })

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const sessionResponse = await axios.post('http://localhost:3000/host/session/create', {
          selectedExperimentId: experimentId,
          roomCode: roomCode,
          hostSocketId: 'abcd123',
          startTimeStamp: null,
          isPasswordProtected: false,
          password: '',
          isSpectatorAllowed: true,
          endTimeStamp: null
        })
        setTimeout(() => {
          //-----HARDCODED FOR TESTING-------
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
  function handleChange(e) {
    console.log(e.target.files)
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  useEffect(() => {
    if(imageSource){
      setIsFileSelected(true);
    }
  }, [imageSource]);
  return (
    <div className="flex h-screen px-8">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-1/2">
      <Toaster position="top-right" />
        <SideComponent
          icon={<PiRocketLaunchThin style={{ fontSize: '200px' }} />}
          headingTitle="Create a Gallery Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select multiple photos to get started"
        />
      </div>
      {/* Middle */}
      <div className="flex flex-col items-center justify-center w-2/5">
      <p className="text-lg text-gray-600"> Experiment ID: {experimentId || "None"}</p>
      <p className="text-lg text-gray-600"> Room Code: {roomCode || "None"}</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
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
              disabled={!experimentTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentTitle.trim() && isFileSelected
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
            {/*This will redirect to Media Page */}
          </div>
          </form>
          </div>
      <div className="w-1/2 flex justify-center items-center">
      <GalleryInput
        imageList={imageList}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        onFileSelected={setIsFileSelected}
        onSourceChange={setImageSource}
        onOpenModalPhoto={handleOpenModalPhoto}
        imageSource={imageSource}
        caption={caption}
        onCaptionChange={setCaption}
      />
    </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="LAB CONFIRMATION"
        button='Create Lobby'
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
            value={imageSource}
            onChange={(e) => setImageSource(e.target.value)}
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
      <ModalComponent
        onAction={handleConfirmImage}
        isOpen={isModalOpenPhoto}
        onCancel={handleCloseModalPhoto}
        modalTitle="Add an Image"
        button='Confirm'
      >
        <div className="mb-6">
          <label htmlFor="experimentImage" className="block text-md font-medium text-gray-700 mb-2">
            File Upload
          </label>
          <input
            type="file"
            id="uploadImage"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if(file){
                const url = URL.createObjectURL(file)
                setTempImage(url)
              }
            }}
          />
        </div>
        {tempImage && (
          <div className="mb-6 flex justify-center">
            <img src={tempImage} alt="Preview" className="max-w-xs rounded-md shadow-md"/>
          </div>
        )}
        <div className="mb-6">
          <label htmlFor="caption" className="block text-md font-medium text-gray-700 mb-2">
            Caption
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