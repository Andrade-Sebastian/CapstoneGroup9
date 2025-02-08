import React, { ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { IoVideocam } from 'react-icons/io5'
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { LiaSatelliteSolid } from 'react-icons/lia'
import CardComponentRadio from '../components/Components/CardComponentRadio.tsx'
import SideComponent from '../components/Components/SideComponent.tsx'
import toast, { Toaster } from 'react-hot-toast'
//added routing to /host/select-lab
//8:49 -
//created HostSelectlabPage
//installed nextUI
//Use a listbox from nextUI
//https://nextui.org/docs/components/listbox

//    const { nickName, roomCode } = location.state || {};

export interface ILab {
  id: string
  name: string
  description: string
  iconPath?: ReactElement
}

export default function HostSelectLabPage() {
  const location = useLocation()
  console.log('@HOST SELECT LAB | location.state:', JSON.stringify(location.state))
  const { userName } = location.state
  console.log('HOSTSELECTLAB userName: ' + userName)
  const [experimentName, setExperimentName] = useState('')
  const [labDescription, setLabDescription] = useState('')
  const [selectedLab, setSelectedLab] = useState<ILab>()

  const labs: Array<ILab> = [
    {
      id: '01234',
      name: 'Video Lab',
      description:
        'Create a video lab experiment. Insert your own video or include a link for the experiment.',
      iconPath: <IoVideocam className="size-8" />
    },
    {
      id: '1',
      name: 'Video Lab 2',
      description:
        'Create a video lab experiment. Insert your own video or include a link for the experiment.',
      iconPath: <IoVideocam className="size-8" />
    },
    {
      id: '2',
      name: 'Picture Lab',
      description:
        'Create a picture lab experiment. Insert your own picture or include a gif for the experiment.',
      iconPath: <TiCamera className="size-8" />
    },
    {
      id: '3',
      name: 'GalleryLab',
      description: 'Create a gallery experiment. Insert pictures to create a gallery style lab.',
      iconPath: <TfiGallery className="size-8" />
    }
  ]
  const navigateTo = useNavigate()

  //const [labs, setLabs] = useState([]); //will hold the labs

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (selectedLab) {
      const labID = selectedLab.id
      if (selectedLab.id === '1') {
        navigateTo('/host/video-lab', { state: { userName, labID } })
      } else if (selectedLab.id === '2') {
        navigateTo('/host/photo-lab', { state: { userName, labID } })
      } else if (selectedLab.id === '3') {
        navigateTo('/host/gallery-lab', { state: { userName, labID } })
      } else {
        toast.error("Error, select another option.")
        //toast
      }
    }

    console.log('Lab Name: ' + experimentName)
    console.log('Lab Description: ' + labDescription)
    console.log('Continue Button clicked')
    console.log('Navigating to Media')
  }
  function handlePreviousExperiments(e: { preventDefault: () => void }) {
    e.preventDefault()
    navigateTo('/host/past-experiments')
  }

  useEffect(() => {
    console.log(selectedLab)
  }, [selectedLab])

  // export default function ExperimentCreationForm({ handleSubmit, setExperimentName, setLabDescription, userName }) {
  return (
    <div className="flex h-screen">
      <div className="flex flec-col max-sm:hidden items-center justify-center w-2/5">
      <Toaster position="top-right" />
        <SideComponent
          icon={<LiaSatelliteSolid style={{ fontSize: '200px' }} />}
          headingTitle="Create an Experiment"
          description="Time to choose a lab template! Pick between a video, image, or image gallery lab"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-14">
          {/* LAB TEMPLATES */}
          <div className="grid grid-cols-2 grid-rows-2 gap-20 items-center overflow-auto">
            {/* Video Lab Checkbox and Description */}

            {/*A Single lab */}
            {labs.map((lab) => (
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
          </div>
          <button
            type="submit"
            disabled={!selectedLab}
            className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
              selectedLab
                ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </button>
          <div className="flex justify-center mt-4">
            <p
              className="text-semibold text-purple-600 hober:underline cursor-pointer"
              onClick={handlePreviousExperiments}
            >
              {' '}
              View Previously Made Experiments
            </p>{' '}
          </div>
        </form>
      </div>
    </div>
  )
}
