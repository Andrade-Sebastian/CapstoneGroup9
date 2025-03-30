import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import toast, { Toaster } from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import axios from 'axios'
import socket from '../Views/socket'
import React from 'react'

//pdf to try:https://arxiv.org/pdf/quant-ph/0410100.pdf


interface IArticleInputForm {
  width: number
  height: number
  onFileSelected: (isFileSelected: boolean) => void
  articleSource: string | undefined
}

export default function ArticleInputForm(props: IArticleInputForm) {
  const inputRef = React.useRef<HTMLInputElement>(null) //access to file input when the host clicks choose image button
  const [source, setSource] = React.useState<string | null>(null) //URL of the file that is selected is stored here.
  const [error, setError] = React.useState<string | null>(null) //need this just in case user doesn't select an image or another error comes up

  const {
    //Global state
    experimentId,
    roomCode,
    experimentTitle,
    experimentDesc,
    setExperimentTitle,
    setExperimentDesc,
    setExperimentId,
    articleLabSource,
    setArticleLabSource,
    setArticleURL,
    articleURL
  } = useSessionStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [usingLink, setUsingLink] = useState(false)
  const [isTheURLValid, setIsTheURLValid] = useState(false);
  const [article_filename, set_article_filename] = useState<string | null>(null)

  const navigateTo = useNavigate()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleAction = (e) => {
    console.log('Creating lobby...')
    handleSubmit(e)
    handleCloseModal()
  }

  const clearFileSelection = () => {
    setFile(null)
    set_article_filename(null)
    setArticleLabSource('')
    setIsFileSelected(false)
  }

  const clearArticleLinks = () => {
    setArticleURL('')
  }

  //Online Article Links Logic
  // useEffect(() => {
  //   console.log('Checking whether host is typing an Article link')
  //   if (!articleURL) {
  //     console.log('Host not typing link')
  //     setUsingLink(false)
  //   }
  //   console.log('Host is typing a link')
  //   setUsingLink(true)
  // }, [articleURL])

  useEffect(() => {
    if (!articleURL.trim()) {
      console.log('Article link was cleared, allowing for file upload.')
      setUsingLink(false);
      clearArticleLinks();
      setIsTheURLValid(false);
    }
  }, [articleURL])

  useEffect(() => {
    if (articleURL && articleLabSource) {
      toast.error('Detected both a online article and file. Please choose one.')
      clearFileSelection()
    }
  }, [articleURL, articleLabSource])

  const handleLinkSubmission = async (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      try{
        const urlObj = new URL(articleURL);
        const isPDF = urlObj.pathname.endsWith('.pdf');
        const response = await fetch(articleURL, { method: 'GET', mode: "no-cors", headers: { "Content-Type": "application/pdf"}});
        if (urlObj) {
          setIsTheURLValid(true);
          toast.success('Your link is valid!')
          clearFileSelection()
          setUsingLink(true);
        } else {
          setIsTheURLValid(false);
          toast.error('URL is not a valid link.')
        }
      }catch(error){
        console.log("Not valid link for Article", error)
        toast.error("Invalid URL format or unreachable.")
      }
    }
  }

  useEffect(() => {
    if (article_filename) {
      setIsFileSelected(true)
      setUsingLink(false)
    }
  }, [article_filename])

  async function handleSubmit(e) {
    const data = new FormData()
    data.append('labType', 'article-lab')
    data.append('experimentTitle', experimentTitle)
    data.append('experimentDescription', experimentDesc)

    if (usingLink && isTheURLValid) {
      data.append('articleURL', articleURL)
      data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))
    } else if (file) {
      data.append('articleBlob', file)
      data.append('socketID', JSON.stringify(sessionStorage.getItem('socketID')))
    } else {
      toast.error('Please provide a valid Article link or upload a local PDF file.')
      return
    }

    const loadingToastId = toast.loading('Creating Lab...')
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      //create a article lab
      console.log('Sending data', [...data])
      const response = await axios.post('http://localhost:3000/database/article-lab', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log('After /article-lab, ', JSON.stringify(response.data))

      if (response.status === 200) {
        toast.success('Lab was created successfully', { id: loadingToastId })
        const expId = response.data.experimentID
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
    console.log('article source: ', article_filename)
    console.log('experimentTitle: ', experimentTitle)
    console.log('experimentDesc: ', experimentDesc)
    console.log('isFileSelected: ' + JSON.stringify(isFileSelected))
  }, [articleLabSource, experimentDesc, experimentTitle])

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

    if (file.type !== 'application/pdf') {
      //makes sure that the file is an pdf
      setError('Please upload a valid pdf file.')
      props.onFileSelected(false) //no file selected. set to false so host cannot continue without selecting an image
      return;
    }
    console.log('Here is the file type:', file.type);
    clearArticleLinks()
    setFile(file)
    setError(null)
    const url = URL.createObjectURL(file) //a temp url is generated for the selected file which is stored in the source state for previewing the image
    set_article_filename(file.name)
    setArticleLabSource(url)
    props.onFileSelected(true) //file is selected, host can now continue
  }
  const handleChoose = () => {
    inputRef.current?.click()
  }

  async function sendData(e) {
    console.log('Sent')
  }

  useEffect(() => {
    console.log("Updated article source:", articleLabSource)
  },[articleLabSource])

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-3/5 p-6 min-h-[600px] space-y-6 mt-50">
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
            <label htmlFor="addArticle" className="block text-sm font-medium text-gray-700 mb-2">
              Add Article <span className="text-purple-500"> *</span>
            </label>
            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter an Article Link (Press Enter to Confirm)
            </label>
            <div className="flex flex-row">
              <input
                type="text"
                id="article-url"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setArticleURL(e.target.value)}
                onKeyDown={handleLinkSubmission}
                placeholder="Paste Article link here..."
              ></input>
            </div>
            <div className="flex justify-center mt-4">
              {usingLink ? (
                <div>
                  <iframe src={articleURL} width="100%" height="300px"></iframe>
                  </div>
              ) : (
            <div className="flex flex-col justify-center items-center border p-4 rounded-md shadow-md size-">
              <input
                ref={inputRef}
                className="flex flex-col justify-center items-center border"
                type="file"
                onChange={(e) => {
                  handleFileChange(e)
                  setFile(e.target.files?.[0] || null)
                }}
                accept=".pdf" //restricts just these article files
              />

              {error && <p className="text-red-500 text-sm mt-2"> {error}</p>}
              {/* article Preview */}
              {articleLabSource && (
                <div className="mt-4">
                  <iframe src={articleLabSource} width="400px" height="400px"></iframe>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600">
                {articleLabSource ? 'Article selected' : ' Please select an article'}
                {/* show url or if there isn't anything, then just show nothing selected text */}
              </div>
            </div>

              )}
            </div>
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal} //create the object
              disabled={
                ((!experimentTitle.trim() || !isFileSelected) &&
                  (!experimentTitle.trim() || !isTheURLValid)) ||
                (isFileSelected && isTheURLValid)
              }
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out cursor-pointer ${
                (experimentTitle.trim() && isFileSelected) ||
                (experimentTitle.trim() && isTheURLValid && !(isFileSelected && isTheURLValid))
                  ? 'bg-[#7F56D9] hover:bg-violet-500 text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </form>

        {/* Modal that appears after submitting */}
        <span className="text-red-500">*Warning*</span> For link uploads, not all links will work. Downloading, then uploading is heavily recommended
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
          {usingLink ? (
            <input
              type="text"
              id="video-url"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={articleURL}
            />
          ) : (
            <input
              type="text"
              id="experimentImage"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
              value={JSON.stringify(article_filename)}
              onChange={(e) => setArticleLabSource(e.target.value)}
            />
          )}
        </div>
      </ModalComponent>
    </>
  )
}
