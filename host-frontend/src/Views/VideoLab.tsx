import { TbUfo } from "react-icons/tb";
import SideComponent from "../components/Components/SideComponent";
import React, { useState } from "react";
import VideoInput from "../components/Components/VideoInput.js";
import toast, { Toaster } from "react-hot-toast";
import ModalComponent from "../components/Components/ModalComponent.js";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function VideoLab() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  function handleSubmit() {
    //ADD TOASTS AND MODAL CONFIRMATION
  }
  const [experimentTitle, setExperimentTitle] = useState("");
  const [experimentDesc, setExperimentDesc] = useState("");
  const [isFileSelected, setIsFileSelected] = useState(false);

  function handleChange(e) {
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<TbUfo style={{ fontSize: "200px" }} />}
          headingTitle="Create a Video Lab"
          description="Start creating your experiment with videos. Choose a title, write a description, and select a a video to get started"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
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
              width={250}
              height={500}
              onFileSelected={setIsFileSelected}
            />
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              disabled={!experimentTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentTitle.trim() && isFileSelected
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
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
      onAction={()=> console.log("a")}
      isOpen={true}
      onCancel={()=>console.log("c")}
      modalTitle='Lab Confirmed'
      >
        <div className="mb-6">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              
              <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              id="experimentTitle"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled
            />
          </div>
        </ModalComponent>
    </div>
  );
}
