import { useNavigate, useLocation } from 'react-router-dom'
import React, { ReactElement, useEffect, useState } from 'react'
import react from 'react' //path?
import ImageCardComponent from '../components/Components/ImageCardComponent'
import Carousel from '../components/Components/CarouselComponent'
import SideComponent from '../components/Components/SideComponent.tsx'
import ImageCardComponentRadio from '../components/Components/ImageCardComponentRadio'
import { BsMoonStars } from 'react-icons/bs'
import toast, { Toaster } from 'react-hot-toast'

export interface IPLab {
  id: string
  name: string
  description: string
  imageUrl: string
  videoUrl?: string; 
}
export default function PreviouslyMadeExperiments() {
  const navigateTo = useNavigate()
  const location = useLocation()
  const userName = location.state?.username || 'defaultUser'
  const [selectedLab, setSelectedLab] = useState<IPLab>()
  const labs: Array<IPLab> = [
    {
      id: '1',
      name: 'Video lab #1',
      description: 'A sexy Mike Tyson with his cheeks out lab to monitor temperature and arousal.',
      imageUrl: 'https://i.dailymail.co.uk/1s/2024/11/16/04/92135043-0-image-a-1_1731729974205.jpg',
      videoUrl: 'http://localhost:5173/fb67346b-af06-4f21-b303-074ab99b8dfa'
    },
    {
      id: '3',
      name: 'Gallery lab #1',
      description: 'Gallery of past presidents',
      imageUrl:
        'https://cdn.britannica.com/43/173043-050-957816CE/oil-George-Washington-canvas-Gilbert-Stuart-Washington.jpg?w=400&h=300&c=crop'
    },
    {
      id: '2',
      name: 'photo lab #1',
      description: 'A picture of will smith',
      imageUrl:
        'https://hips.hearstapps.com/hmg-prod/images/will-smith-attends-varietys-creative-impact-awards-and-10-directors-to-watch-brunch-at-the-parker-palm-springs-on-january-3-2016-in-palm-springs-california-photo-by-jerod-harrisgetty-images.jpg?crop=1xw:1.0xh;center,top&resize=640:*'
    }
  ]
  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (selectedLab) {
      const labID = selectedLab.id;
      const name = selectedLab.name;
      const description = selectedLab.description;
      const imageUrl = selectedLab.imageUrl;
      const videoUrl = selectedLab.videoUrl;
      if (selectedLab.id === '1') {
        navigateTo('/host/video-lab', { state: { userName, labID, name, description, imageUrl, videoUrl } })
      } else if (selectedLab.id === '2') {
        navigateTo('/host/photo-lab', { state: { userName, labID, name, description, imageUrl } })
      } else if (selectedLab.id === '3') {
        navigateTo('/host/gallery-lab', { state: { userName, labID, name, description, imageUrl } })
      } else {
        toast.error('Select one to continue')
        //toast
      }
    }
  }

  useEffect(() => {
    console.log(selectedLab)
  }, [selectedLab])
  return (
    <>
      <div className="flex h-screen">
        <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
          <Toaster position="top-right" />
          <SideComponent
            icon={<BsMoonStars style={{ fontSize: '200px' }} />}
            headingTitle="View Previously Made Experiments"
            description="Stuck on what to create? Click on some previously made experiments and get started right away!"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-2/5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-14">
            {/* LAB TEMPLATES */}
            <div className="grid grid-cols-2 grid-rows-2 gap-20 items-center overflow-auto">
              {/* Video Lab Checkbox and Description */}

              {/*A Single lab */}
              {labs.map((lab) => (
                <ImageCardComponentRadio
                  key={lab.id}
                  selectedLab={selectedLab}
                  handler={() => setSelectedLab(lab)}
                  value={lab}
                  headingTitle={lab.name}
                  imageUrl={lab.imageUrl}
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
          </form>
        </div>
      </div>
    </>
  )
}
