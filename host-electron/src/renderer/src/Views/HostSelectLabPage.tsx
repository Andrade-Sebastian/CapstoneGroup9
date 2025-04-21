import React, { ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { IoVideocam, IoNewspaper } from 'react-icons/io5'
import { GiSandCastle } from "react-icons/gi";
import { RiGalleryFill } from "react-icons/ri";
import { TiCamera } from 'react-icons/ti'
import { LiaSatelliteSolid } from 'react-icons/lia'
import CardComponentRadio from '../components/CardComponentRadio.tsx'
import SideComponent from '../components/SideComponent.tsx'
import toast, { Toaster } from 'react-hot-toast'
import { useSessionStore } from '../store/useSessionStore.tsx'


export interface ILab {
  id: string
  name: string
  description: string
  iconPath?: ReactElement
}

export default function HostSelectLabPage() {
  const navigateTo = useNavigate()
  const { setExperimentType, roomCode } = useSessionStore();
  const [experimentName, setExperimentName] = useState('')
  const [labDescription, setLabDescription] = useState('')
  const [selectedLab, setSelectedLab] = useState<ILab>()

  const labs: Array<ILab> = [
    {
      id: '1',
      name: 'Video Lab',
      description:
        'Create a video lab experiment. Insert your own video or include a link for the experiment.',
      iconPath: <IoVideocam className="size-8" />
    },
    {
      id: '2',
      name: 'Picture Lab',
      description:
        'Create a picture lab experiment. Insert your own picture or include a GIF for the experiment.',
      iconPath: <TiCamera className="size-8" />
    },
    {
      id: '3',
      name: 'GalleryLab',
      description: 'Create a gallery experiment. Insert pictures to create a gallery style lab.',
      iconPath: <RiGalleryFill className="size-8" />
    },
    {
      id: '4',
      name: 'Article Lab',
      description:
        'Create an article lab experiment. Insert your own PDF or include a link for the experiment.',
      iconPath: <IoNewspaper className="size-8" />
    },
    {
      id: '5',
      name: 'Sandbox',
      description:
        'Create an experiment without any type of media.',
      iconPath: <GiSandCastle className="size-8" />
    }
  ]

  //const [labs, setLabs] = useState([]); //will hold the labs

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (selectedLab) {
      if (selectedLab.id === '1') {
        setExperimentType(1);
        navigateTo('/host/video-lab')
      } else if (selectedLab.id === '2') {
        setExperimentType(2);
        navigateTo('/host/photo-lab')
      } else if (selectedLab.id === '3') {
        setExperimentType(3);
        navigateTo('/host/gallery-lab')
      } else if (selectedLab.id === '4'){
        setExperimentType(4);
        navigateTo('/host/article-lab')
      } else if (selectedLab.id === '5'){
        setExperimentType(5);
        navigateTo('/waiting-room')
      }else {
        toast.error("Error, select another option.")
        //toast
      }
    }

    console.log('Lab Name: ' + experimentName)
    console.log('Lab Description: ' + labDescription)
    console.log('Continue Button clicked')
    console.log('Navigating to Media')
  }

  useEffect(()=> {
    console.log("In select lab page");
  })
  function handlePreviousExperiments(e: { preventDefault: () => void }) {
    e.preventDefault()
    navigateTo('/host/past-experiments')
  }

  useEffect(() => {
    console.log("Selected Lab: ", selectedLab)
  }, [selectedLab])

  // export default function ExperimentCreationForm({ handleSubmit, setExperimentName, setLabDescription, userName }) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="hidden md:flex flex-col items-center justify-center lg:w-1/3 w-2/5">
      <Toaster position="top-right" />
        <SideComponent
          icon={<LiaSatelliteSolid style={{ fontSize: '200px' }} />}
          headingTitle="Create an Experiment"
          description="Time to choose a lab template! Pick between a video, image, gallery, or article lab. Pick sandbox if you want to create an experiment without any media!"
        />
      </div>
      {/* Templates Container*/}
      <div className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-2/3 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-2xl">
          {/* LAB TEMPLATES */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 grid-rows-2 gap-6 items-center w-full">
            {/* Video Lab Checkbox and Description */}

            {/*A Single lab */}
            {labs
              .filter((lab) => lab.id !== '5')
              .map((lab) => (
              <CardComponentRadio
                key={lab.id}
                selectedLab={selectedLab}
                handler={() => setSelectedLab(lab)}
                value={lab}
                headingTitle={lab.name}
                icon={lab.iconPath || <IoVideocam />}
                description={lab.description}
              />
            ))}
            <div className="col-span-full flex justify-center">
              <div className='w-full sm:w-3/4 md:w-2/3 lg: w-1/2'>
              <CardComponentRadio
              key="5"
              selectedLab={selectedLab}
              handler={() => setSelectedLab(labs.find((lab) => lab.id === '5')!)}
              value={labs.find((lab) => lab.id === '5')!}
              headingTitle="Sandbox"
              icon={<GiSandCastle className='size-8'/>}
              description="Create an experiment without any type of media."
              />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!selectedLab}
            className={`w-full md:w-auto mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
              selectedLab
                ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </button>
          <div className="flex justify-center">
            <p
              className="text-semibold text-purple-600 hober:underline cursor-pointer"
              onClick={handlePreviousExperiments}
            >
              View Previously Made Experiments
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
