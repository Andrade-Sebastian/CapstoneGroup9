import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiAlienLight } from 'react-icons/pi'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import SideComponent from '../components/SideComponent'
import ArticleInputForm from '../components/ArticleInputForm'
import ModalComponent from '../components/ModalComponent'
import axios from 'axios'
import socket from './socket'

export default function ArticleLab() {
  const {
    //Global state
    experimentType,
    experimentTitle,
    experimentDesc,
    setExperimentPath,
    articleLabSource
  } = useSessionStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileSelected, setIsFileSelected] = useState(false)

  useEffect(() => {
    if (articleLabSource) {
      setIsFileSelected(true)
    }
  }, [articleLabSource])

  const sendExperimentData = async (
    experimentTitle: string,
    experimentDesc: string,
    experimentId: string
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PATH}/host/send-experiment`,
        {
          experimentTitle,
          experimentDesc,
          experimentId
        }
      )
      console.log('Post response data from sendExperimentData', response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleSubmit(e) {
    console.log('article source', articleLabSource)
    console.log('experimentTitle', experimentTitle)
    console.log('experimentDesc', experimentDesc)

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)
  }

  return (
    <div className="flex">
      <Toaster position="top-right" />
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<PiAlienLight style={{ fontSize: '200px' }} />}
          headingTitle="Create an Article Lab"
          description="Start creating your experiment with an article. Choose a title, write a description, and select an article to get started"
        />
      </div>

      <ArticleInputForm
        width={500}
        height={250}
        onFileSelected={setIsFileSelected}
        articleSource={JSON.stringify(articleLabSource)}
      />
    </div>
  )
}
