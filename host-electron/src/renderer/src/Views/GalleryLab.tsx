import SideComponent from '../components/SideComponent.tsx'
import { PiRocketLaunchThin } from 'react-icons/pi'
import React, { useEffect, useState } from 'react'
import GalleryInputForm from '../components/GalleryInputForm.tsx'
import ModalComponent from '../components/ModalComponent.tsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useSessionStore } from '../store/useSessionStore.tsx'

export default function GalleryLab() {
  const { experimentId, roomCode, addPhoto, addPhotos,removePhoto,clearPhotos,setCurrentGalleryIndex,galleryPhotos, currentGalleryIndex } = useSessionStore();
  const [experimentTitle, setExperimentTitle] = useState('')
  const [experimentDesc, setExperimentDesc] = useState('')
  const [file, setFile] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caption, setCaption] = useState()
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [imageList, setImageList] = useState<{url: string; caption: string} []>([])
  const navigateTo = useNavigate()
  const [isFileSelected, setIsFileSelected] = useState(false)
  
  // const handleOpenModal = () => setIsModalOpen(true)
  // const handleCloseModal = () => {
  //   setTempImage(null)
  //   setIsModalOpen(false)}
  // const handleAction = () => {
  //   console.log('Creating lobby...')
  //   handleSubmit()
  //   //navigateTo("/waiting-room", {state: {nickName, roomCode}});
  //   handleCloseModal()
  // }
  // const handleOpenModalPhoto = () => setIsModalOpenPhoto(true)
  // const handleCloseModalPhoto = () => setIsModalOpenPhoto(false)
  // const handleConfirmImage = () =>{
  //   setImageSource(tempImage)
  //   setIsFileSelected(!!tempImage)
  //   setIsModalOpenPhoto(false)
  // }

  // const handleAddImage =(image: {url: string; caption; string}) => {
  //   setImageList((prev) => [...prev, image])
  // }

  // const handleRemoveImage = (index: number) =>{
  //   setImageList((prev) => prev.filter((_, i) => i !== index))
  // }
  useEffect(() => {
    if (galleryPhotos) {
      setIsFileSelected(true)
    }
  }, [galleryPhotos])



  const sendExperimentData = async(experimentTitle: string, experimentDesc: string, experimentId: string) => {
    try{
        const response = await axios.post("http://localhost:3000/host/send-experiment", {
          experimentTitle,
          experimentDesc,
          experimentId
        });
        console.log("Post response data from sendExperimentData", response.data);
    }
    catch(error){
      console.error("Error:", error);
    }
  }
  
  async function handleSubmit() {
    // console.log("image source", photoLabImageSource);
    console.log("caption", caption);
    console.log("experimentTitle", experimentTitle);
    console.log("experimentDesc", experimentDesc);

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)
  }
  // function handleChange(e) {
  //   console.log(e.target.files)
  //   setFile(URL.createObjectURL(e.target.files[0]))
  // }

  // useEffect(() => {
  //   if(imageSource){
  //     setIsFileSelected(true);
  //   }
  // }, [imageSource]);
  return (
    <div className="flex w-full">
      <Toaster position="top-right" />
      <div className="flex flex-col max-sm:hidden items-center justify-center w-1/3">
        <SideComponent
          icon={<PiRocketLaunchThin style={{ fontSize: '200px' }} />}
          headingTitle="Create a Gallery Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select multiple photos to get started"
        />
      </div>
      <div className='w-2/3'>
      <GalleryInputForm
        width={500}
        height={250}
        onFileSelected={setIsFileSelected}
        imageSource={JSON.stringify(imageSource)}
      />
      </div>

    </div>
  )
}