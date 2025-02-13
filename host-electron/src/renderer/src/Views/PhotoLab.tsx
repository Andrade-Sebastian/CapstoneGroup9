import { PiShootingStarThin } from 'react-icons/pi';
import SideComponent from '../components/Components/SideComponent.tsx';
import React, { useEffect, useState } from 'react';
import PhotoInput from '../components/Components/PhotoInput.tsx';
import ModalComponent from '../components/Components/ModalComponent.tsx';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
//import createSessionInDatabase from "../../../../../WaveBrigade-backend/server/src/controllers/database.ts"
import { IUser } from '../hooks/useSessionState.tsx';


export default function PhotoLab() {
  const location = useLocation()
  const navigateTo = useNavigate()
  const { userName, labID, name, newExperiment, description, imageUrl} = location.state || {};
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [experimentTitle, setExperimentTitle] = useState(name || '')
  const [experimentDesc, setExperimentDesc] = useState(description || '')
  const [caption, setCaption] = useState('')
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageSource, setImageSource] = useState<string | null>(imageUrl || null)
  //
  //console.log('*photolab*', JSON.stringify(location.state))


  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
    console.log('Creating lobby...');
    handleSubmit();
    handleCloseModal();
  }

  async function handleSubmit() {
  //ADD TOASTS AND MODAL CONFIRMATION
  //add to database using /database/photo-lab
  const loadingToastId = toast.loading('Creating Lab...')
  if (isSubmitting) return

  setIsSubmitting(true)

  try {
    //logic for sending code to backend
    //Create the experiment before doing this
    console.log("EXPERIMENT ID: ", newExperiment.experimentid);

    const response = await axios.post('http://localhost:3000/database/photo-lab', {
      experimentID: newExperiment.experimentid,
      path: imageSource, //null
      captions: caption
    });
    
      if (response.status === 200) {
        
        console.log("!!!creating a session");
        toast.success('Lab was created successfully', { id: loadingToastId });
        const sessionResponse = await axios.post("http://localhost:3000/host/session/create", {
          selectedExperimentId: newExperiment.experimentid,
          roomCode: "12345",
          hostSocketId: "abcd123",
          startTimeStamp: null,
          isPasswordProtected: false,
          password: "",
          isSpectatorsAllowed: true,
          endTimeStamp: null
        });
        console.log("done creating session")
        const roomCode = sessionResponse.data.roomcode;
        console.log("navigating to waiting room", roomCode);
          //-----HARDCODED FOR TESTING-------
          console.log(userName, roomCode, labID, name, description, imageUrl);
          navigateTo('/waiting-room', { state: { userName, roomCode, labID, name, description, imageUrl } })
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
    <div className="flex h-screen">
      <Toaster position="top-right" />
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<PiShootingStarThin style={{ fontSize: '200px' }} />}
          headingTitle="Create a Photo Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select a photo to get started"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
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
          <div className="mb-6">
            <label htmlFor="addImage" className="block text-sm font-medium text-gray-700 mb-2">
              Add Image
              <span className="text-purple-500"> *</span>
            </label>

            <PhotoInput
              width={500}
              height={250}
              onFileSelected={setIsFileSelected}
              onSourceChange={setImageSource}
              imageSource={imageSource}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a Caption
              <span className="text-purple-500"> *</span>
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
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        button='Create Lobby'
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
    </div>
  )
}
