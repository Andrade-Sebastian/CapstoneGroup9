import { TbUfo } from "react-icons/tb";
import SideComponent from "../components/SideComponent";
import React, { useEffect, useState } from "react";
import VideoInput from "../components/VideoInput.js";
import ModalComponent from "../components/ModalComponent.js";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast'
import socket from './socket';
import axios from 'axios'
import { useSessionStore } from '../store/useSessionStore.tsx'

export default function VideoLab() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [experimentTitle, setExperimentTitle] = useState(name || '');
  const [experimentDesc, setExperimentDesc] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const navigateTo = useNavigate();
  const {roomCode, experimentType} = useSessionStore();

  useEffect(() => {
    if(videoSource){
      setIsFileSelected(true);
    }
  }, [videoSource]);

  //modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAction = () => {
    console.log("Creating lobby...");
    handleSubmit();
    handleCloseModal();
  };
  const handleFileSelected = (isFileSelected: boolean) => {
    console.log("File selected:", isFileSelected);
  }
  
  function handleChange(e) {
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
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
      const response = await axios.post('http://localhost:3000/database/video-lab', {
        experimentID: experimentType,
        path: videoSource, //null
      })

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const sessionResponse = await axios.post('http://localhost:3000/host/session/create', {
          selectedExperimentId: experimentType,
          roomCode: roomCode,
          hostSocketId: 'abcd123',
          startTimeStamp: null,
          isPasswordProtected:false,
          password: '',
          isSpectatorsAllowed: true,
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
  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
      <Toaster position="top-right" />
        <SideComponent
          icon={<TbUfo style={{ fontSize: "200px" }} />}
          headingTitle="Create a Video Lab"
          description="Start creating your experiment with videos. Choose a title, write a description, and select a a video to get started"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-3/5 p-6">
      <p className="text-lg text-gray-600"> Experiment ID: {experimentType || "None"}</p>
      <p className="text-lg text-gray-600"> Room Code: {roomCode || "None"}</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Title for Experiment{" "}
              <span className="text-purple-500">*</span>
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
              Enter Description for Experiment{" "}
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
            <label
              htmlFor="experimentVideo"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Add a Video
              <span className="text-purple-500"> *</span>
            </label>
            <VideoInput
              width={200}
              height={500}
              onFileSelected={setIsFileSelected}
              onSourceChange = {setVideoSource}
              videoSource={videoSource}
            />
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!experimentTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentTitle.trim() && isFileSelected
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
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
      modalTitle='LAB CONFIRMATION'
      button="Create Lobby"
      >
        <div className="mb-6">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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
            <label
              htmlFor="experimentDesc"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description of Experiment{" "}
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
            <label
              htmlFor="experimentVideo"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              File Upload
            </label>
            <input
              type="text"
              id="experimentVideo"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={videoSource}
              onChange={(e) => setVideoSource(e.target.value)}
            />
           
          </div>
        </ModalComponent>
    </div>
  );
}
